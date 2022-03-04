const mongoose = require("mongoose");
  
const adSchema = new mongoose.Schema({
  nombre: { type: String, index: true },
  imagen: String,
  descripcion: { type: String },
  venta: { type: Boolean, index: true },
  precio: { type: Number, index: true },
  tags: { type: [String], index: true },
  reservado: { type: Boolean },
  vendido: { type: Boolean },
  usuario: { type: String, index: true },
});

  adSchema.statics.lista = function(filtro, skip, limit, select, sort) {
    const query = Ad.find(filtro); 
    query.skip(skip);
    query.limit(limit);
    query.select(select);
    query.sort(sort);
    return query.exec();
  }

  /* lista de tags permitidos
  */
 adSchema.statics.listTags = function () {
   return ['work', 'lifestyle', 'motor', 'mobile'];
 };

 adSchema.statics.deleteAdsByUser = function (id) {
  let i=0;
  const query = Ad.find({ usuario: id});
  query.exec().then( result =>{
    result.forEach(
      async element=> {await Ad.deleteOne({_id: element._id})
      i=i+1;}
    )
  })
  return i;
};
  
  
const Ad = mongoose.model("Anuncio", adSchema)

module.exports = Ad;