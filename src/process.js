const v = require('./services/validation');

// eslint-disable-next-line no-console
console.log('By custom logic');
let errors = v.validateJsonFileByCustomLogic(
  `${process.cwd()}/resources/articles.json`
);
errors.forEach((error) => {
  // eslint-disable-next-line no-console
  console.log(error);
});

// eslint-disable-next-line no-console
console.log('By library');
errors = v.validateJsonFileBySchema(
  `${process.cwd()}/resources/articles.json`,
  `${process.cwd()}/resources/schema.json`
);
errors.forEach((error) => {
  // eslint-disable-next-line no-console
  console.log(error);
});
