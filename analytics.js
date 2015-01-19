Insights = new Meteor.Collection('insights');

if (Meteor.isClient) {
  Template.insights.helpers({
    tableSettings: function() {
      return {
        collection: Insights,
        fields: [
          'type',
          'area',
          'artifact',
          'companyName',
          'companyType',
          'project',
          'city',
          'githubUrl',
          'date',
        ]

      }
    }
  });

  Template.newInsight.events({
    'submit [data-new-insight]': function(e, tmpl) {
      e.preventDefault();
      var type = tmpl.find('select[data-type]').value;
      var area = tmpl.find('input[data-area]').value;
      var artifact = tmpl.find('textarea[data-artifact]').value;
      var companyName = tmpl.find('input[data-company-name]').value;
      var companyType = tmpl.find('input[data-company-type]').value;
      var project = tmpl.find('input[data-project]').value;
      var city = tmpl.find('input[data-city]').value;
      var githubUrl = tmpl.find('input[data-githubUrl]').value;
      var date = tmpl.find('input[data-date]').value;

      Insights.insert({
        type: type,
        area: area,
        artifact: artifact,
        companyName: companyName,
        companyType: companyType,
        project: project,
        city: city,
        githubUrl: githubUrl,
        date: date,
      });
    }
  });
}

if (Meteor.isServer) {
  Meteor.startup(function () {
    // code to run on server at startup
  });
}
