const fs = require('fs');
const validUrl = require('valid-url');
const yup = require('yup');
const { buildYup } = require('json-schema-to-yup');

const regexOptions = {
  id: '(\\{){0,1}[0-9a-fA-F]{8}\\-[0-9a-fA-F]{4}\\-[0-9a-fA-F]{4}\\-[0-9a-fA-F]{4}\\-[0-9a-fA-F]{12}(\\}){0,1}',
  title: '[^(?!\\s*$)id.+]{1,255}',
  author: '[^(?!\\s*$).+]{1,100}',
  date: '^(0[1-9]|1[012])[- /.](0[1-9]|[12][0-9]|3[01])[- /.](19|20)\\d\\d$',
  url: '[(http(s)?)://(www\\.)?a-zA-Z0-9@:%._\\+~#=]{2,256}\\.[a-z]{2,6}\b([-a-zA-Z0-9@:%_\\+.~#?&//=]*)',
};

const sourceOptions = ['ARTICLE', 'BLOG', 'TWEET', 'NEWSPAPER'];

const config = {
  errMessages: {
    id: {
      required: 'You must enter an id',
      pattern: 'ID must be a GUID',
    },
    title: {
      required: 'You must enter the article title',
      pattern: 'Not a valid article title',
    },
    author: {
      required: 'You must enter the author name',
      pattern: 'Not a valid author name',
    },
    modifiedAt: {
      required: 'You must enter modified date',
      pattern: 'Not a valid modified date',
    },
    publishedAt: {
      pattern: 'Not a valid published date',
    },
    url: {
      format: 'Not a valid url',
      pattern: 'Not a valid url',
    },
    keywords: {
      pattern: 'Not a a valid keyword',
    },
    readMins: {
      required: 'You must enter reading minutes',
      pattern: 'Not a valid reading minutes format',
    },
    source: {
      required: 'You must enter source',
      pattern: 'Not a valid source format',
    },
  },
};

function validateStringRegex(regexp, data, node, num) {
  const regexpobj = new RegExp(regexp, 'ig');
  return regexpobj.test(data)
    ? { status: 'OK', error: '' }
    : {
        status: 'NOK',
        error: `Value in node ${node} on item number ${num} has incorrect format`,
      };
}

function validateJsonArrayItem(item, itemNum) {
  const errors = [];
  Object.keys(item).forEach((key) => {
    const val = item[key];
    switch (key) {
      case 'id': {
        const result = validateStringRegex(regexOptions.id, val, key, itemNum);
        if (result.status === 'NOK') errors.push(result.error);
        break;
      }
      case 'title': {
        const result = validateStringRegex(
          regexOptions.title,
          val,
          key,
          itemNum
        );
        if (result.status === 'NOK') errors.push(result.error);
        break;
      }
      case 'author': {
        const result = validateStringRegex(
          regexOptions.author,
          val,
          key,
          itemNum
        );
        if (result.status === 'NOK') errors.push(result.error);
        break;
      }
      case 'modifiedAt': {
        const result = validateStringRegex(
          regexOptions.date,
          val,
          key,
          itemNum
        );
        if (result.status === 'NOK') errors.push(result.error);
        break;
      }
      case 'publishedAt': {
        const result = validateStringRegex(
          regexOptions.date,
          val,
          key,
          itemNum
        );
        if (result.status === 'NOK') errors.push(result.error);
        break;
      }
      case 'url': {
        if (!validUrl.isUri(val))
          errors.push(
            `Node ${key} on item number ${itemNum} has incorrect URL format`
          );
        break;
      }
      case 'keywords':
        if (!Array.isArray(val)) {
          errors.push(`Node ${val} on item number ${itemNum} must be an aray`);
        } else if (val.length < 1 || val.length > 3)
          errors.push(
            `Node ${key} on item number ${itemNum} is an array of min lenth 1 and max lenght 3`
          );
        break;
      case 'readMins':
        if (!Number.isInteger(val)) {
          errors.push(
            `Node ${key} on item number ${itemNum} must be an integer`
          );
        } else if (val < 1 || val > 20)
          errors.push(
            `Node ${key} on item number ${itemNum} is a number min 1 and max 20`
          );
        break;
      case 'source':
        if (!sourceOptions.includes(val)) {
          errors.push(
            `Node ${key} on item number ${itemNum} must be of values ${sourceOptions}`
          );
        }
        break;
      default:
        errors.push(`Unrecognized node name: ${key}`);
    }
  });
  return errors;
}

function validateJsonFileByCustomLogic(file) {
  const jsonRawData = fs.readFileSync(file, 'utf8');
  const jsonData = JSON.parse(jsonRawData);
  const errors = [];
  let itemNum = 1;
  Object.keys(jsonData).forEach((key) => {
    const item = jsonData[key];
    errors.push(validateJsonArrayItem(item, itemNum));
    itemNum += 1;
  });
  return errors;
}

function validateJsonFileBySchema(file, schema) {
  const jsonRawData = fs.readFileSync(file, 'utf8');
  const jsonData = JSON.parse(jsonRawData);
  const schemaRawData = fs.readFileSync(schema, 'utf8');
  const schemaData = JSON.parse(schemaRawData);
  const errors = [];
  const yupSchema = buildYup(schemaData, config);
  yupSchema.fields.url = yup.string().url();
  Object.keys(jsonData).forEach((key) => {
    const item = jsonData[key];
    try {
      yupSchema.validateSync(item);
    } catch (error) {
      errors.push(error.message);
    }
  });
  return errors;
}

module.exports.validateJsonFileByCustomLogic = validateJsonFileByCustomLogic;
module.exports.validateJsonFileBySchema = validateJsonFileBySchema;
