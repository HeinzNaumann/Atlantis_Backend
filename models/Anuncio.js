const mongoose = require("mongoose");
  
const adSchema = new mongoose.Schema({
  nombre: { type: String, index: true },
  imagen: String,
  description: { type: String },
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

  
  
const Ad = mongoose.model("Anuncio", adSchema)

module.exports = Ad;