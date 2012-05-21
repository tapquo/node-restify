// Copyright 2012 Mark Cavage, Inc.  All rights reserved.

var formidable = require('formidable');

var args = require('../args');
var errors = require('../errors');



///--- Globals

var BadRequestError = errors.BadRequestError;



///--- API

/**
 * Returns a plugin that will parse the HTTP request body IFF the
 * contentType is multipart/form-data
 *
 * If req.params already contains a given key, that key is skipped and an
 * error is logged.
 *
 * @return {Function} restify handler.
 * @throws {TypeError} on bad input
 */
function multipartBodyParser(options) {
        if (!options)
                options = {};
        args.assertObject('options', options);

        var override = options.overrideParams;
        function parseMultipartBody(req, res, next) {
                if (req.contentType !== 'multipart/form-data' ||
                    (req.contentLength === 0 && !req.chunked))
                        return (next());

                var form = new formidable.IncomingForm();

                form.parse(req, function (err, fields, files) {
                        if (err)
                                return (next(new BadRequestError(err.message)));

                           req.body = fields;
                           req.files = files;

                           if (options.mapParams !== false) {
                                   Object.keys(fields).forEach(function (k) {
                                           if (req.params[k] && !override)
                                                   return (false);

                                           req.params[k] = fields[k];
                                           return (true);
                                   });
                           }

                           return (next());
                });

                return (false);
        }

        return (parseMultipartBody);
}

module.exports = multipartBodyParser;