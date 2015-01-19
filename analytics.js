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
  
  Template.charts.rendered = function() {  
    Deps.autorun(function () { drawChart(); });
    
  };
}

var myRadarChart;

function drawChart() {
  var insights = Insights.find().fetch()
  var countsByTypeByArea = {} /* like
    {
      "Onboarding": {
        "S": 3,
        "M": 12,
        "L": 5,
      }
    }
  */

  for(var i = 0; i < insights.length; i++) {
    var insight = insights[i];
    
    var countsByType = countsByTypeByArea[insight.area] || {}
    
    var count = (countsByType[insight.companyType] || 0) + 1
    countsByType[insight.companyType] = count
    
    countsByTypeByArea[insight.area] = countsByType
  }
  
  var areas = _.keys(countsByTypeByArea)
  var datasets = {}
  for(var i = 0; i < areas.length; i++) {
    var area = areas[i];
    var countsByType = countsByTypeByArea[area];
    var types = Object.keys(countsByType);
    for(var j = 0; j < types.length; j++) {
      var type = types[i];
      var count = countsByType[type] || 0;
      var dataset = datasets[type] || {
        label: type,
        fillColor: "rgba(220,220,220,0.2)",
        strokeColor: "rgba(220,220,220,1)",
        pointColor: "rgba(220,220,220,1)",
        pointStrokeColor: "#fff",
        pointHighlightFill: "#fff",
        pointHighlightStroke: "rgba(220,220,220,1)",
        data: []
      };
      dataset.data.push(count);
      
      datasets[type] = dataset;
    }
  }
  
  console.log("data sets", datasets)
  
  if(_.size(datasets) == 0)
    return;
  
  var ctx = document.getElementById("insight-chart").getContext("2d");
  if(myRadarChart)
    myRadarChart.destroy();
  
  var myRadarChart = new Chart(ctx).Radar({
    labels: areas,
    datasets: _.values(datasets)
  });
}

if (Meteor.isServer) {
  Meteor.startup(function () {
    // code to run on server at startup
  });
}
