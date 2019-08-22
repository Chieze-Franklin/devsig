const { prompt } = require('inquirer');

const questions = [{
  type: 'input',
  name: 'email',
  message: 'Enter email: '
}, {
  type: 'input',
  name: 'password',
  message: 'Enter password: '
}]

module.exports = async function() {
  const answers = await prompt(questions);
  console.log(answers)
}