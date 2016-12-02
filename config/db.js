
// Exemplo de SQLITE3
// exports.ramais = {
//   // driver poder ser => postgres, sqlite3, mssql
//   "adapter": "sqlite3",
//   // endereço
//   "host": "/teste.db",
//   // "database": "teste.db",
//   // nome da tabela utilizada
//   "table": "devices",
//   // colunas -> separadas por vírgula (pode colocar alias, pois deve ter id, name)
//   "cols": "id, description as name",
//   // outras opções
//   "insecureAuth": true,
// }

// Exemplo de MySQL
exports.ramais = {
  "adapter": "mysql",
  "host": "0.0.0.0",
  "user": "usuario",
  "password": "1234",
  "database": "asterisk",
  "table": "devices", // table where the extensions are
  // colunas -> separadas por vírgula (pode colocar alias, pois deve ter id, name)
  "columns": "id, description as name, devicetype, tech",
  // outras opções
  "insecureAuth": true,
}

// Exemplo de MySQL
exports.filas = {
  "adapter": "mysql",
  "host": "0.0.0.0",
  "user": "usuario",
  "password": "1234",
  "database": "asterisk",
  "table": "queues_config", // table where the extensions are
  // colunas -> separadas por vírgula (pode colocar alias, pois deve ter id, name)
  "columns": "extension as id, descr as name",
  // outras opções
  "insecureAuth": true,
}

// // Exemplo de Postgres
// exports.ramais = {
//   "adapter": "postgres",
//   "host": "localhost",
//   "user": "postgres",
//   "password": "1234",
//   "database": "monitor",
//   "table": "extensions",
//   // colunas -> separadas por vírgula (pode colocar alias, pois deve ter id, name)
//   "columns": "id, description as name, avatar",
//   // outras opções
//   "insecureAuth": true,
// }

// Exemplo de MySQL
exports.sms = {
  "adapter": "mysql",
  "host": "0.0.0.0",
  "user": "usuario",
  "password": "1234",
  "database": "convert_sms",
  "table_sent": "sms_enviados",
  "columns_sent": {
    "id": "id",
    "id_mensagem": "id_mensagem",
    "numero": "numero",
    "data_preparado": "data_preparado",
    "data_enviado": "data_enviado",
    "data_confirmado": "data_confirmado",
    "id_sms_status": "id_sms_status",
    "texto": "texto",
    "campanha": "campanha",
    "contato": "contato",
    "operadora_destino": "operadora_destino",
  },
  "table_received": "sms_recebidos",
  "columns_received": {
  },
  // outras opções
  "insecureAuth": true,
}