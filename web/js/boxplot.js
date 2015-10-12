function do_boxplot(divID, mesh) {
	/* Draws a box plot, given the labelID, color */
	console.log("doing boxplots")

 	var div_dom = $("#" + divID);
 	div_dom.empty();
 	div_dom.html("loading...");
 	
	labelID = mesh.name;
	color = [mesh.geometry.faces[0].color["r"],
			  mesh.geometry.faces[0].color["g"],
			  mesh.geometry.faces[0].color["b"]];

	var labels = true;
	function componentToHex(c) {
		var hex = c.toString(16);
		return hex.length == 1 ? "0" + hex : hex;
	}

	function rgbToHex(r, g, b) {
		return "#" + componentToHex(parseInt(r * 255))
				   + componentToHex(parseInt(g * 255))
				   + componentToHex(parseInt(b * 255));
	}
	rgbColor = rgbToHex(color[0], color[1], color[2])
	var margin = {
		top: 30,
		right: 50,
		bottom: 70,
		left: 50
	};
	var width = 400 - margin.left - margin.right;
	var height = 300 - margin.top - margin.bottom;
	var min = Infinity,
		max = -Infinity;

	var csvID = (Number(labelID) == 1) ? 999 : Number(labelID) + 999;
	filename = "data/mindboggled/Twins-2-1/tables/left_exploded_tables/" + csvID + ".0.csv"
	
	d3.csv(filename, function(error, csv) {
		div_dom.empty();
		var data = [];
		data[0] = [];
		data[1] = [];
		data[2] = [];
		data[3] = [];
		data[4] = [];
		data[0][0] = "travel";
		data[1][0] = "geodesic";
		data[2][0] = "mean curv";
		data[3][0] = "FS curv";
		data[4][0] = "FS thick";
		data[0][1] = [];
		data[1][1] = [];
		data[2][1] = [];
		data[3][1] = [];
		data[4][1] = [];

		csv.forEach(function(x) {
			var v1 = Math.floor(x.travel_depth),
				v2 = Math.floor(x.geodesic_depth),
				v3 = Math.floor(x.mean_curvature),
				v4 = Math.floor(x.freesurfer_curvature),
				v5 = Math.floor(x.freesurfer_thickness);
			var rowMax = Math.max(v1, Math.max(v2, Math.max(v3, Math.max(v4, v5))));
			var rowMin = Math.min(v1, Math.min(v2, Math.min(v3, Math.min(v4, v5))));
			data[0][1].push(v1);
			data[1][1].push(v2);
			data[2][1].push(v3);
			data[3][1].push(v4);
			data[4][1].push(v5);
			if (rowMax > max) max = rowMax;
			if (rowMin < min) min = rowMin;
		});

		var chart = d3.box().whiskers(iqr(1.5)).height(height).domain([min, max]).showLabels(labels);

		var svg = d3.select("#" + divID)
			.append("svg")
			.attr("width", width + margin.left + margin.right)
			.attr("height", height + margin.top + margin.bottom)
			.attr("class", "box")
			.append("g")
			.attr("transform", "translate(" + margin.left + "," + margin.top + ")");
		var x = d3.scale.ordinal().domain(data.map(function(d) {
			return d[0]
		})).rangeRoundBands([0, width], 0.7, 0.3);

		var xAxis = d3.svg.axis().scale(x).orient("bottom");
		svg.selectAll(".box").data(data).enter().append("g").attr("transform", function(d) {
			return "translate(" + x(d[0]) + "," + margin.top + ")";
		}).call(chart.width(x.rangeBand()));

		svg.append("text").attr("x", (width / 2)).attr("y", 0 + (margin.top / 2)).attr("text-anchor", "middle").style("font-size", "18px").text("Shape distributions");
		svg.append("g").attr("class", "x axis").attr("transform", "translate(0," + (height + margin.top + 10) + ")").call(xAxis).append("text").attr("x", (width / 2)).attr("y", 10).attr("dy", ".71em").style("text-anchor", "middle").style("font-size", "16px")
		$("rect").css("fill", rgbColor)
	});

	function iqr(k) {
		return function(d, i) {
			var q1 = d.quartiles[0],
				q3 = d.quartiles[2],
				iqr = (q3 - q1) * k,
				i = -1,
				j = d.length;
			while (d[++i] < q1 - iqr);
			while (d[--j] > q3 + iqr);
			return [i, j];
		};
	}
}
