function getValidJson(value: string) {
  try {
    return JSON.parse(value) as UntypedObject | Array<any>;
  } catch (error) {
    return 'invalid';
  }
}

export default getValidJson;
