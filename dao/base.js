function BaseDAO(collectionName) {

    this.collectionName = collectionName;
}

BaseDAO.prototype.write = function(key, data, cb) {

    throw new Error('Method write did not implement');
};

BaseDAO.prototype.read = function(key, cb) {

    throw new Error('Method read did not implement');
};

module.exports = BaseDAO;