// this method is called when chart is first inited as we listen for "rendered" event
function zoomChart(chart, chartData) {
    if (chartData == null) {
        return;
    }
    // different zoom methods can be used - zoomToIndexes, zoomToDates, zoomToCategoryValues
    chart.zoomToIndexes(chartData.length - 30000, chartData.length - 1);
}

function generateChartData(data_from_python) {
    var chartData = [];

    for (i in data_from_python) {
        datetimeStr = data_from_python[i].datetime;
        dateTime = datetimeStr.split(" ")
        var date = dateTime[0].split("/");
        var yy = date[0];
        var mm = date[1]-1;
        var dd = date[2];

        var time = dateTime[1].split(":");
        var hh = time[0];
        var m = time[1];
        var ss = parseInt(time[2]);

        var newDate = new Date(yy, mm, dd, hh, m, ss);
        var amp = parseFloat(data_from_python[i].value)
        chartData.push({
            date: newDate,
            value: amp,
            humid: parseFloat(data_from_python[i].humid),
            value6: parseFloat(data_from_python[i].value6)
        });
    }
    return chartData;
}

function update_amchart(json_data) {
    var chart_data = generateChartData(json_data);
	var chart = AmCharts.makeChart("my_amchart", {
		"type": "serial",
		"theme": "light",
		"fontSize": 16,
		"marginRight": 80,
		"autoMarginOffset": 20,
		"marginTop": 10,
		"dataProvider": chart_data,
        "legend": {
			"autoMargins": false,
			"borderAlpha": 0.2,
			"equalWidths": false,
			"horizontalGap": 10,
			"markerSize": 20,
			"useGraphSettings": true,
			"valueAlign": "left",
			"valueWidth": 10
    	},
		"valueAxes": [{
            "id": "currentAxis",
			"axisAlpha": 0.2,
			"dashLength": 1,
			"position": "left"
		}, {
            "id": "humidAxis",
            "axisAlpha": 0.1,
            "dashLength" : 1,
            "position": "right"
        }],
		"mouseWheelZoomEnabled": true,
		"graphs": [{
			"balloonText": "溫度: [[value]] °C",
			"bulletBorderAlpha": 1,
			"bulletColor": "#FFFFFF",
			"hideBulletsCount": 50,
			"title": "溫度",
			"valueField": "value",
            "legendPeriodValueText": "[[value]] °C",
			"useLineColorForBulletBorder": true,
            "fillAlphas": 0.2,
            "valueAxis": "currentAxis",
            "negativeLineColor": "#b60000",
		}, { 
			"balloonText": "氣體值: [[value]]",
			"bulletBorderAlpha": 1,
			"bulletColor": "#FFFFFF",
			"hideBulletsCount": 50,
			"title": "氣體值",
			"valueField": "value6",
            "legendPeriodValueText": "[[value]]",
			"useLineColorForBulletBorder": true,
            "fillAlphas": 0.0,
            "valueAxis": "currentAxis",
        }, {
			"balloonText": "溼度: [[value]]%",
			"bulletBorderAlpha": 1,
			"bulletColor": "#FFFFFF",
			"hideBulletsCount": 50,
			"title": "溼度",
			"valueField": "humid",
			"useLineColorForBulletBorder": true,
            "legendPeriodValueText": "[[value]]%",
            "fillAlphas": 0.0,
            "valueAxis": "humidAxis",

        }],
		"chartScrollbar": {
			"autoGridCount": true,
			"scrollbarHeight": 40
		},
		"chartCursor": {
			"categoryBalloonAlpha": 0.6,
			"categoryBalloonColor": "#FF0000",
			"categoryBalloonFunction": function(d) {
				var year = d.getFullYear();
				var month = d.getMonth();
				var day = d.getDate();
				var hr = d.getHours();
				var min = d.getMinutes();
				var sec = d.getSeconds();
				return [year, month, day].join('/') + ' ' + [hr, min, sec].join(':');
			}
		},
		"categoryField": "date",
		"categoryAxis": {
            "minPeriod" : "ss",
			"parseDates": true,
			"axisColor": "#DADADA",
			"dashLength": 1,
			"minorGridEnabled": true,
		},
		"export": {
			"enabled": true
		}
	});
	chart.addListener("rendered", zoomChart);
	zoomChart(chart, chart_data);
}

$(function() {
        json_data = [];
        for (i = 0; i < qq['data'].length; ++i) {
            var toks = qq['data'][i].split(" ");
            json_data.push({'datetime': toks[0] + " " + toks[1], 
                    'value': parseFloat(toks[2]), 
                    'humid': parseFloat(toks[3]),
                    'value6': parseFloat(toks[4])});
        }
        update_amchart(json_data)
});
