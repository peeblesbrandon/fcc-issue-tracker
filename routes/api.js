/*
*
*
*       Complete the API routing below
*
*
*/

'use strict';

var expect = require('chai').expect;
var MongoClient = require('mongodb');
var ObjectId = require('mongodb').ObjectID;
const mongoose = require('mongoose');

const Issue = require('../models/Issue.js');
mongoose.connect(process.env.DATABASE, { useNewUrlParser: true, useUnifiedTopology: true, useCreateIndex: true});

module.exports = function (app) {
      app.route('/api/issues/:project')
        .get(function (req, res) {
          // console.log('attempting to get issues in project', req.params.project, 'with the following query parameters:');
          // build query dynamically based on provided props
          var query = { project: req.params.project };
          for (const prop in req.query) {
            query[prop] = req.query[prop]
          }
          // console.log(query);
          // execute query
          Issue.find(query, (err, docs) => {
            if (err) {
              // console.log('error fetching documents: ', err);
              res.status(500).json({ error: 'could not fetch documents', errorDescription: err });
            } else {
              // console.log('successfully located documents:\n', docs);
              res.status(200).json(docs);
            }
          });
        })

        .post(function (req, res){                                    // create new issue                    
          var project = req.params.project;
          // console.log('creating new issue with inputs:\n', req.body);
          const newIssue = new Issue({
            project: project,
            issue_title: req.body.issue_title,
            issue_text: req.body.issue_text,
            created_by: req.body.created_by,
            assigned_to: req.body.assigned_to,
            status_text: req.body.status_text
          });
          newIssue.save()
            .then(result => {
              // console.log('issue successfully created:\n', newIssue);
              return res.status(201).json(newIssue);
            })
            .catch(err => {
              // console.log('error creating issue:\n', err);
              return res.status(500).json({ 
                error: 'Failed to create new issue', 
                errorDescription: err 
              });
            });
        })

        .put(function (req, res){                                    // update existing issue
          var project = req.params.project;
          // console.log('updating issue with inputs:\n', req.body);
          // check that we were sent fields to update
          if ((!req.body.issue_title || req.body.issue_title == '') && 
              (!req.body.issue_text  || req.body.issue_text == '' ) && 
              (!req.body.created_by  || req.body.created_by == '' ) && 
              (!req.body.created_by  || req.body.assigned_to == '') &&
              (!req.body.status_text || req.body.status_text == '') &&
              req.body.hasOwnProperty('open') === false) {
            // console.log('no updated field sent');
            return res.status(400).send('no updated field sent');
          }
          // build update object
          var issueUpdates = {}
          if (req.body.issue_title && req.body.issue_title != '') { issueUpdates.issue_title = req.body.issue_title; }
          if (req.body.issue_text && req.body.issue_text != '') { issueUpdates.issue_text = req.body.issue_text; }
          if (req.body.created_by && req.body.created_by != '') { issueUpdates.created_by = req.body.created_by; }
          if (req.body.assigned_to && req.body.assigned_to != '') { issueUpdates.assigned_to = req.body.assigned_to; }
          if (req.body.status_text && req.body.status_text != '') { issueUpdates.status_text = req.body.status_text; }
          if (req.body.hasOwnProperty('open')) { issueUpdates.open = false; } // close issue if prop exists (box checked)
          // find doc and apply updates
          Issue.updateOne({ _id: req.body._id }, issueUpdates, (err, issue) => {
            if (err) {
              // console.log('error updating', req.body._id);
              // console.log('error output:', err);
              return res.status(500).send('could not update ' + req.body._id)
            } else {
              // console.log('successfully updated');
              return res.status(200).send('successfully updated');
            }
          });
        })

        .delete(function (req, res){
          var project = req.params.project;
          // console.log('attempting to delete issue with id #', req.body._id);
          if (!req.body.hasOwnProperty('_id') || req.body._id === '') {
            // console.log('_id error');
            return res.status(400).send('_id error');
          }
          Issue.deleteOne({ _id: req.body._id}, (err, issue) => {
              if (err) {
                // console.log('could not find issue to delete');
                return res.status(500).send('could not delete ' + req.body._id);
              } else {
                // console.log('deleted ' + req.body._id);
                return res.status(200).send('deleted ' + req.body._id);
              }
            })
        });
    };

