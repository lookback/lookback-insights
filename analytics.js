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

var datasetTemplates = [
  {
    fillColor: "rgba(220,120,120,0.2)",
    strokeColor: "rgba(220,120,120,1)",
    pointColor: "rgba(220,120,120,1)",
    pointStrokeColor: "#fff",
    pointHighlightFill: "#fff",
    pointHighlightStroke: "rgba(220,220,220,1)",
    data: []
  },
  {
    fillColor: "rgba(127,205,127,0.2)",
    strokeColor: "rgba(127,205,127,1)",
    pointColor: "rgba(127,205,127,1)",
    pointStrokeColor: "#fff",
    pointHighlightFill: "#fff",
    pointHighlightStroke: "rgba(151,187,205,1)",
    data: []
  },
  {
    fillColor: "rgba(127,127,205,0.2)",
    strokeColor: "rgba(127,127,205,1)",
    pointColor: "rgba(127,127,205,1)",
    pointStrokeColor: "#fff",
    pointHighlightFill: "#fff",
    pointHighlightStroke: "rgba(151,187,205,1)",
    data: []
  },
  {
    fillColor: "rgba(151,205,205,0.2)",
    strokeColor: "rgba(151,187,205,1)",
    pointColor: "rgba(151,187,205,1)",
    pointStrokeColor: "#fff",
    pointHighlightFill: "#fff",
    pointHighlightStroke: "rgba(151,187,205,1)",
    data: []
  }
];
var datasetTemplateIndex = 0;

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
  
  console.log("source", countsByTypeByArea);
  
  var areas = _.keys(countsByTypeByArea)
  var datasets = {}
  for(var i = 0; i < areas.length; i++) {
    var area = areas[i];
    var countsByType = countsByTypeByArea[area];
    var types = Object.keys(countsByType);
    for(var j = 0; j < types.length; j++) {
      var type = types[j];
      var count = countsByType[type] || 0;
      var dataset = datasets[type] || datasetTemplates[datasetTemplateIndex++];
      dataset.label = type
      dataset.data.push(count);
      
      datasets[type] = dataset;
    }
  }
  
  if(_.size(datasets) == 0)
    return;
  
  document.getElementById("insight-chart-container").innerHTML = "";
  document.getElementById("insight-chart-container").innerHTML = '<canvas id="insight-chart" width="250" height="250"></canvas>'
  var ctx = document.getElementById("insight-chart").getContext("2d");
  if(myRadarChart)
    myRadarChart.destroy();
  
  var myRadarChart = new Chart(ctx).Radar({
    labels: areas,
    datasets: _.values(datasets)
  }, {
    responsive: false,
    legendTemplate : '<ul class="<%=name.toLowerCase()%>-legend"><% for (var i=0; i<datasets.length; i++){%><li><span style="background-color:<%=datasets[i].fillColor%>; color:<%=datasets[i].pointColor%>;"><%if(datasets[i].label){%><%=datasets[i].label%><%}%></span></li><%}%></ul>'
  });
  
  document.getElementById("insight-chart-legend-container").innerHTML = myRadarChart.generateLegend();
}

if (Meteor.isServer) {
  Meteor.startup(function () {
    // code to run on server at startup
  });
}
