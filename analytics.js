Insights = new Meteor.Collection('insights');

Accounts.config({
  forbidClientAccountCreation : true
});

Meteor.methods({
  addInsight: function (props) {
    // Make sure the user is logged in before inserting a task
    if (! Meteor.userId()) {
      throw new Meteor.Error("not-authorized");
    }
    
    Insights.insert(_.extend(_props, {
      author: Meteor.user().emails[0].address,
    }));
  }
});


if (Meteor.isClient) {
  Meteor.subscribe("insights");
  
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
          'author',
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

      Meteor.call("addInsight",{
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
    highlightFill: "#fff",
    strokeColor: "rgba(220,120,120,1)",
    pointColor: "rgba(220,120,120,1)",
    pointStrokeColor: "#fff",
    pointHighlightFill: "#fff",
    pointHighlightStroke: "rgba(220,220,220,1)",
    data: []
  },
  {
    fillColor: "rgba(127,205,127,0.2)",
    highlightFill: "#fff",
    strokeColor: "rgba(127,205,127,1)",
    pointColor: "rgba(127,205,127,1)",
    pointStrokeColor: "#fff",
    pointHighlightFill: "#fff",
    pointHighlightStroke: "rgba(151,187,205,1)",
    data: []
  },
  {
    fillColor: "rgba(127,127,205,0.2)",
    highlightFill: "#fff",
    strokeColor: "rgba(127,127,205,1)",
    pointColor: "rgba(127,127,205,1)",
    pointStrokeColor: "#fff",
    pointHighlightFill: "#fff",
    pointHighlightStroke: "rgba(151,187,205,1)",
    data: []
  },
  {
    fillColor: "rgba(151,205,205,0.2)",
    highlightFill: "#fff",
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
  var types = []
  var countsByTypeByArea = {} /* like
    {
      "Onboarding": {
        "S": 3,
        "M": 12,
        "L": 5,
      }
    }
  */
  
  datasetTemplateIndex = 0

  for(var i = 0; i < insights.length; i++) {
    var insight = insights[i];
    
    var countsByType = countsByTypeByArea[insight.area] || {}
    
    var count = (countsByType[insight.companyType] || 0) + 1
    countsByType[insight.companyType] = count
    
    countsByTypeByArea[insight.area] = countsByType
    
    if(!_.contains(types, insight.companyType)) {
      types.push(insight.companyType);
    }
  }
  
  var areas = _.keys(countsByTypeByArea)
  var datasets = {}
  for(var i = 0; i < areas.length; i++) {
    var area = areas[i];
    var countsByType = countsByTypeByArea[area];
    for(var j = 0; j < types.length; j++) {
      var type = types[j];
      var count = countsByType[type] || 0;
      if(!datasets[type]) {
        datasets[type] = datasetTemplates[datasetTemplateIndex++];
        datasets[type].data = []
      }
      var dataset = datasets[type];
      dataset.label = type
      dataset.data.push(count);
      
      //console.log("type", type, "Area", area, "new count", count)
      
      datasets[type] = dataset;
    }
  }
  
  if(_.size(datasets) == 0)
    return;
  
  //console.log("Labels:", areas)
  //console.log("New data sets:", _.values(datasets));
  
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
  Meteor.publish("insights", function () {
    if(this.userId) {
      return Insights.find();
    } else {
      return null;
    }
  });
  
  Meteor.startup(function () {
    // code to run on server at startup
  });
}
