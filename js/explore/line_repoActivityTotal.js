/* Creates line graph visualization for webpage */
function draw_line_repoActivityTotal(areaID) {

	// load data file, process data, and draw visualization
	var url = ghDataDir+'/labRepos_Activity.json';
	d3.json(url, function(obj) {
		var data = reformatData(obj);
		drawGraph(data, areaID);
	});

	var parseTime = d3.timeParse("%Y-%m-%d");
	var formatTime = d3.timeFormat("%Y-%m-%d");


	// Draw graph from data
	function drawGraph(data, areaID) {

		var graphHeader = "Activity Across All Repos [Default Branches, 1 Year]";

		data.forEach(function(d) {
			d.date = parseTime(d.date);
			d.value = +d.value;
		});

		var margin = {top: stdMargin.top, right: stdMargin.right, bottom: stdMargin.bottom, left: stdMargin.left*1.15},
			width = (stdTotalWidth*2) - margin.left - margin.right,
			height = stdHeight;

		var x = d3.scaleTime()
			.clamp(true)
			.domain(d3.extent(data, function(d) { return d.date; }))
			.range([0, width]);

		var y = d3.scaleLinear()
			.domain([0, d3.max(data, function(d) { return d.value; })])
			.range([height, 0])
			.nice();

		var dToday = x.domain()[1];
		// Supercomputing
		var dSupercomp = getYearDate("11-18",dToday);
		// Thanksgiving
		var dThnxgiv = getYearDate("11-25",dToday);
		// Christmas
		var dXmas = getYearDate("12-25",dToday);

		var xAxis = d3.axisBottom()
			.scale(x);

		var yAxis = d3.axisLeft()
			.scale(y);

		var area = d3.area()
			.x(function(d) { return x(d.date); })
			.y0(height)
			.y1(function(d) { return y(d.value); });

		var tip = d3.tip()
			.attr('class', 'd3-tip')
			.offset([-10, 0])
			.html(function(d) {
				var repos = " Commits";
				if (d.value == 1) {
					repos = " Commit";
				}
				return "<sub>[Week of "+formatTime(d.date)+"]</sub>"+"<br>"+d.value+repos;
			});

		var valueline = d3.line()
			.x(function(d) { return x(d.date); })
			.y(function(d) { return y(d.value); });

		var chart = d3.select("."+areaID)
			.attr("width", width + margin.left + margin.right)
			.attr("height", height + margin.top + margin.bottom)
		  .append("g")
			.attr("transform", "translate(" + margin.left + "," + margin.top + ")");

		chart.call(tip);

		// Add the x axis
		chart.append("g")
			.attr("class", "x axis")
			.attr("transform", "translate(0," + height + ")")
			.call(xAxis);

		// Add the y axis
		chart.append("g")
			.attr("class", "y axis")
			.call(yAxis);

		// Add title
		chart.append("text")
			.attr("class", "graphtitle")
			.attr("x", (width / 2))
			.attr("y", 0 - (margin.top / 3))
			.attr("text-anchor", "middle")
			.text(graphHeader);

		// Add y axis label
		chart.append("text")
			.attr("class", "axistitle")
			.attr("transform", "rotate(-90)")
			.attr("y", 0 - margin.left + (margin.left / 4))
			.attr("x", 0 - (height / 2))
			.attr("text-anchor", "middle")
			.text("Commits");

		// Draw fill
		chart.append("path")
			.datum(data)
			.attr("class", "area")
			.attr("d", area);

		// Draw line
		chart.append("path")
			.datum(data)
			.attr("class", "line")
			.attr("d", valueline);

		// Draw date-of-interest reference lines
		//    Supercomputing
		chart.append("path")
			.datum([
				{date:dSupercomp, value:y.domain()[0]},
				{date:dSupercomp, value:y.domain()[1]}
				])
			.attr("class", "refline")
			.attr("d", valueline);
		chart.append("text")
			.attr("class", "reftext")
			.attr("transform", "rotate(-90)")
			.attr("y",  x(dSupercomp)-4 )
			.attr("x", 0 - (height / 4))
			.attr("text-anchor", "middle")
			.text("Supercomputing");
		//    Thanksgiving
		chart.append("path")
			.datum([
				{date:dThnxgiv, value:y.domain()[0]},
				{date:dThnxgiv, value:y.domain()[1]}
				])
			.attr("class", "refline")
			.attr("d", valueline);
		chart.append("text")
			.attr("class", "reftext")
			.attr("transform", "rotate(-90)")
			.attr("y",  x(dThnxgiv)-4 )
			.attr("x", 0 - (height / 4))
			.attr("text-anchor", "middle")
			.text("Thanksgiving");
		//    Christmas
		chart.append("path")
			.datum([
				{date:dXmas, value:y.domain()[0]},
				{date:dXmas, value:y.domain()[1]}
				])
			.attr("class", "refline")
			.attr("d", valueline);
		chart.append("text")
			.attr("class", "reftext")
			.attr("transform", "rotate(-90)")
			.attr("y",  x(dXmas)-4 )
			.attr("x", 0 - (height / 4))
			.attr("text-anchor", "middle")
			.text("Christmas");

		// Draw dots
		chart.selectAll(".circle")
			.data(data)
		  .enter().append("circle")
			.attr("class", "circle")
			.attr("cx", function(d) { return x(d.date); })
			.attr("cy", function(d) { return y(d.value); })
			.attr("r", stdDotRadius)
			.on('mouseover', tip.show)
			.on('mouseout', tip.hide);

		// Angle the axis text
		chart.select(".x.axis")
			.selectAll("text")
			.attr("transform", "rotate(12)")
			.attr("text-anchor", "start");
	};


	// Turn json obj into desired working data
	function reformatData(obj) {
		// Calculate combined values
		var dataTotals = {};
		var repos = Object.keys(obj["data"]);
		repos.forEach(function (repo) {
			if (obj["data"].hasOwnProperty(repo)) {
				var weeklyNodes = obj["data"][repo];
				for (var i=0; i<weeklyNodes.length; i++) {
					var weekstamp = weeklyNodes[i]["week"];
					var weeklytotal = weeklyNodes[i]["total"];
					if (!Object.keys(dataTotals).contains(weekstamp)) {
						dataTotals[weekstamp]=0;
					}
					dataTotals[weekstamp] += weeklytotal;
				}
			}
		});

		// Formate data for graphing
		var data = [];
		for (var timestamp in dataTotals) {
			data.push({date: timestamp, value: dataTotals[timestamp]});
		};

		return data;
	};


	// Return appropriate date object for a month-day date given the graph's time range
	function getYearDate(monthDayString, dToday) {
		var thisYear = formatTime(dToday).split("-")[0];
		if (d3.min([dToday,parseTime(thisYear+"-"+monthDayString)]) == dToday) {
			var aYear = (parseInt(thisYear)-1).toString();
			return parseTime(aYear+"-"+monthDayString);
		} else {
			return parseTime(thisYear+"-"+monthDayString);
		}
	};

}