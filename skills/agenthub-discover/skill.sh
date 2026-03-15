#!/bin/bash
# AgentHub Discover Skill
# 用于 AI Agent 调用的 AgentHub 发现技能

REGISTRY_URL="${AGENTHUB_REGISTRY:-https://agenthub.cyou}"

case "$1" in
  list)
    curl -s "${REGISTRY_URL}/api/agents" | jq '.agents[] | {slug, name, version, description}'
    ;;

  search)
    [ -z "$2" ] && echo "Usage: $0 search <keyword>" && exit 1
    curl -s "${REGISTRY_URL}/api/agents?q=$2" | jq '.agents[] | {slug, name, version, description}'
    ;;

  info)
    [ -z "$2" ] && echo "Usage: $0 info <slug>" && exit 1
    curl -s "${REGISTRY_URL}/api/agents/$2" | jq .
    ;;

  skills)
    [ -z "$2" ] && echo "Usage: $0 skills <slug>" && exit 1
    curl -s "${REGISTRY_URL}/api/agents/$2" | jq '{name, skills: .includes.skills, memory: .includes.memory}'
    ;;

  install-cmd)
    [ -z "$2" ] && echo "Usage: $0 install-cmd <slug>" && exit 1
    curl -s "${REGISTRY_URL}/api/agents/$2" | jq -r '"agenthub install " + .slug + " --registry ./.registry --target-workspace <workspace>"'
    ;;

  *)
    echo "AgentHub Discover Skill"
    echo ""
    echo "Usage:"
    echo "  $0 list              - 列出所有 Agent"
    echo "  $0 search <keyword>  - 搜索 Agent"
    echo "  $0 info <slug>       - 获取 Agent 详情"
    echo "  $0 skills <slug>     - 获取 Agent 技能列表"
    echo "  $0 install-cmd <slug> - 获取安装命令"
    ;;
esac
