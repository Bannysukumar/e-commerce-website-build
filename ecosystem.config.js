module.exports = {
  apps: [{
    name: 'swebirdshop',
    script: 'npm',
    args: 'start',
    cwd: '/www/wwwroot/swebirdshop.com/e-commerce-website-build',
    interpreter: '/usr/bin/node',
    interpreter_args: '',
    env: {
      NODE_ENV: 'production',
      PATH: '/usr/bin:/usr/local/bin:/usr/sbin:/usr/bin:/sbin:/bin'
    }
  }]
}

