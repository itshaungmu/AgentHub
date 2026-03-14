  module.exports = {
    apps: [{
      name: 'agenthub',
      script: 'src/cli.js',
      args: 'serve --registry ./.registry --port 3000 --host 0.0.0.0',
      instances: 'max',
      exec_mode: 'cluster',
      max_memory_restart: '4G',
      node_args: '--max-old-space-size=2048',
      env: {
        NODE_ENV: 'production'
      }
    }]
  }