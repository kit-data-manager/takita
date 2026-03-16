import { uniqueId } from 'lodash';

const msgType = Object.freeze({
  error: 'error',
  success: 'success',
  regular: 'regular',
  obsolete: 'obsolete',
});

const template = {
  text: '',
  type: msgType.regular,
  uid: null,
};

class Message {
  constructor(data = {}) {
    const prop = { ...template, ...data };
    if (!Object.values(msgType).includes(prop.type)) {
      prop.type = template.type;
    }
    if (prop.uid === null) {
      prop.uid = uniqueId('msg_');
    }
    Object.assign(this, prop);
  }
}

export { Message };
