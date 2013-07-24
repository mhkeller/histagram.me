(function(){
	// Reference for data
	// https://docs.google.com/spreadsheet/ccc?key=0Aoev8mClJKw_dGZ4dElNYm1CTlV6endZT095NXJZWVE#gid=0
	var SETTINGS = {
		bin_or_break: 'bin',
		bin_break_number: 10,
		clustering: 'jenks'
	};

	var CONFIG = {
		table_id: '0Aoev8mClJKw_dGZ4dElNYm1CTlV6endZT095NXJZWVE',
		column_name: 'data',
		histagram_name: 'Histagram',
		y_axis_label: 'Count',
	};

	function rounderToNPlaces(num, places) {
    var multiplier = Math.pow(10, places);
    return Math.round(num * multiplier) / multiplier;
	};

	function constructHistDataDrawChart(data){
		var hist_data = constructHistData(data);
		drawHighChart(hist_data);
	};

	function constructHistData(data){
		var bin_info = createBinsAndXAxis(data, SETTINGS.clustering);
				data_buckets = createDataBuckets(data, bin_info.binned_data, SETTINGS.clustering);
		
		var hist_data = {
			bin_xAxis: bin_info.bin_xAxis,
			data_buckets: data_buckets
		};

		return hist_data;
	
	};

	function createDataBuckets(data, binned_data, clustering){
		var data_buckets = [];
		if (clustering == 'd3'){
			data_buckets  = _.map(binned_data, function(d) { return d.length } );
		}else if (clustering == 'jenks'){
			var thresholds = binned_data; // Lets rename it `thresholds` since that's more accurate for the array that the `jenks` fn returns.
			jenks_scale = d3.scale.threshold()
	      .domain(thresholds)
	      .range(d3.range(binned_data.length ).map(function(i) { return i }));

	    $.each(data, function(index, value){

	    	var q = jenks_scale(value) - 1;
		    if (!data_buckets[q]){
		    	data_buckets[q] = 1;
		    }else{
			    data_buckets[q] = data_buckets[q] + 1
		    };

	    });

	    // Fill in any missing indices as zeros
	    data_buckets = _.map(data_buckets, function(d) { 
	    	if (!d){
	    		return 0;
	    	} else{
	    		return d;
	    	};
	    });

		};

		return data_buckets;
	};

	function createBinsAndXAxis(data, clustering){
		var bins = calcBins(),
				data_min = d3.min(data),
				data_max = d3.max(data),
				bin_xAxis = [],
				binned_data,
				bin_min,
				bin_max;

		/*
			In a perfect world, this if statement is all we would need.
			We would run our data through any different clustering algorithm and it would return us our data broken into different categories.
			The d3 histogram layout returns an array of arrays, that show both the breaks and also contain the items that fall within those breaks.
			That's really handy because it gives us the count of items.
			Jenks, however, only returns the thresholds and so later on when we `createDataBuckets` we'll only need to look at the length of each of these arrays for D3.
			But for jenks we'll need to do that calculation ourselves.
			The two algorithms also have slightly different patterns of inclusivity and exclusivity on their bounds. So there are differences for that.
		*/
		if (clustering == 'd3'){
			binned_data = d3.layout.histogram()
			    .bins(bins)
			    (data);
		}else if (clustering == 'jenks') {
			binned_data = ss.jenks(data, bins);

			var jenks_min = d3.min(binned_data),
					jenks_max = d3.max(binned_data);
		};

		$.each(binned_data, function(index, value){

			if (clustering == 'd3'){
				bin_min = rounderToNPlaces(value['x'], 2);
				bin_max = '<' + rounderToNPlaces(value['x'] + value['dx'], 2);

				if (value['x'] == data_min){
					bin_min = rounderToNPlaces(value['x'], 2);
				};

			}else if (clustering == 'jenks'){
				bin_min =  '>' + rounderToNPlaces(value, 2);
				bin_max = rounderToNPlaces(binned_data[index + 1], 2);

				if (value == jenks_min){
					bin_min = value;
					bin_max = binned_data[index + 1];
				}else if (value == jenks_max){
					return false;
				};
			};

			bin_xAxis.push(String(bin_min + ' to ' + bin_max));

		});

		var bin_info = {
			binned_data: binned_data,
			bin_xAxis: bin_xAxis
		};

		return bin_info;

	};


	function calcBins(){
		var bins;
		if (SETTINGS.bin_or_break == 'break'){
			bins = range / SETTINGS.bin_break_number;
		}else if (SETTINGS.bin_or_break == 'bin'){
			bins = Number(SETTINGS.bin_break_number);
		};

		return bins;
	};

	// http://rosettacode.org/wiki/Averages/Mode#JavaScript
	function calcMode(ary) {
	    var counter = {},
	    		mode = [],
	    		max = 0;
	    for (var i in ary) {
	        if (!(ary[i] in counter))
	            counter[ary[i]] = 0;
	        counter[ary[i]]++;

	        if (counter[ary[i]] == max)
	            mode.push(ary[i]);
	        else if (counter[ary[i]] > max) {
	            max = counter[ary[i]];
	            mode = [ary[i]];
	        };
	    };
	    return mode;
	};

	function drawHighChart(hist_data){
		var chart = new Highcharts.Chart({
      chart: {
        renderTo: 'chart-container',
        type: 'column',
        marginRight: 0,
        marginBottom: 50
      },
      title: {
        text: CONFIG.histagram_name,
        x: 0,
		 		style: {
					color: '#303030',
					font: 'normal 16px "Arial", sans-serif'
				}//center
      },
      subtitle: {
        text: '',
        x: -20
      },
      xAxis: {
        categories: hist_data.bin_xAxis,
			title:{
				text: '',
				style: {
						color: '#303030',
						font: 'normal 13px "Arial", sans-serif'
					}
				}
      },
      yAxis: {
        title: {
          text: 'Count',
				  style: {
						color: '#303030',
						font: 'normal 13px "Arial", sans-serif'
					}
        }
		  },
      tooltip: {
        formatter: function() {
          return 'Count in group: ' + this.y + "<br/>Range: " + this.x;
        },
				borderRadius: 1,
				borderWidth: 1,
				shadow: false
      },
		  plotOptions: {
				series: {
					shadow: false,
					borderWidth: 1,
					borderColor: 'white',
					pointPadding: 0,
					groupPadding: 0,
				},
				column: {
					pointPadding: 0.2,
					borderWidth: 0
				}
		  },
      legend: {
        layout: 'vertical',
        align: 'right',
        verticalAlign: 'top',
        x: -10,
        y: 100,
        borderWidth: 0,
			  enabled:false
      },
      series: [{
        name: CONFIG.y_axis_label,
        data: hist_data.data_buckets,
			  color:'#6c0'
      }]
    });
	};

	function drawDescriptStats(data){
		var mean   = ss.mean(data),
			  median = ss.median(data),
			  mode   = String(calcMode(data).join(', ')),
			  range  = d3.min(data) + '-' + d3.max(data);

		$('#mean span').html(Math.round(mean * 100) / 100);
		$('#median span').html(median);
		$('#mode span').html(mode);
		$('#range span').html(range);
	};

	function fetchData(){
		var ds = new Miso.Dataset({
			url: 'data/dummy-data.csv',
			delimiter: ','
		  // importer : Miso.Dataset.Importers.GoogleSpreadsheet,
		  // parser : Miso.Dataset.Parsers.GoogleSpreadsheet,
		  // key : CONFIG.table_id,
		  // worksheet : "1"
		});

		ds.fetch({
		  success : function() {
		  	var data = this.column(CONFIG.column_name).data;
		  	constructHistDataDrawChart(data);
		  	drawDescriptStats(data);

		  },
		  error : function() {
		  }
		});
	};

	function bindHandlers(){
		$('#break-controls input').change(function(){
			SETTINGS.bin_or_break = $(this).val();
		});
		$('#bins-breaks').change(function(){
			SETTINGS.bin_break_number = $(this).val();
		});
		$('#table-id').change(function(){
			CONFIG.table_id = $(this).val();
		});
		$('#column-name').change(function(){
			CONFIG.column_name = $(this).val();
		});
		$('#histagram-name').change(function(){
			CONFIG.histagram_name = $(this).val();
		});

		$('#submit-btn').click(function(){
			$.bbq.pushState({
				'key': CONFIG.table_id,
				'col': CONFIG.column_name,
				'bob': SETTINGS.bin_or_break,
				'bbn': SETTINGS.bin_break_number
			});
		});
		
		$(window).bind( 'hashchange', function(e) {
			if (window.location.hash != ''){
				var state = $.bbq.getState()
				CONFIG.table_id = state.key;
				CONFIG.column_name = state.col;
				SETTINGS.bin_or_break = state.bob;
				SETTINGS.bin_break_number = state.bbn;
			};
			fetchData();
		});
	};

	function startTheShow(){
		bindHandlers();
		$(window).trigger( 'hashchange' );
	};

	startTheShow();

})();
