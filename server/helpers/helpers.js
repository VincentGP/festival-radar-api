const getModelProperties = (model) => {
  // Generer automatisk body baseret på modellen og gem i variabel
  let body = [];
  model.schema.eachPath((path) => {
    if (path != '_id' && path != '__v') {
      body.push(path);
    }
  });
  return body;
};

module.exports = {
  getModelProperties
};