(function(){
	// Reference for data
	// https://docs.google.com/spreadsheet/ccc?key=0Aoev8mClJKw_dGZ4dElNYm1CTlV6endZT095NXJZWVE#gid=0
	var SETTINGS = {
		bin_or_break: 'bin',
		bin_break_number: 15,
		transform_function: 'raw'
	}

	var CONFIG = {
		table_id: '0Aoev8mClJKw_dGZ4dElNYm1CTlV6endZT095NXJZWVE',
		column_name: 'data',
		histagram_name: 'Histagram',
		y_axis_label: 'Count',
	};

	function constructHistDataDrawChart(data){
		var hist_data = constructHistData(data);
		drawHighChart(hist_data);
	};


	var xAxis = [];
	function constructHistData(data){
		var data_buckets = [],
				max = d3.max(data),
				min = d3.min(data),
				range = max - min,
				bins; 

		if (SETTINGS.bin_or_break == 'break'){
			bins = range / SETTINGS.bin_break_number;
		}else{
			bins = Number(SETTINGS.bin_break_number);
		};

		// Generate a histogram using n uniformly-spaced bins.
		var binned_data = d3.layout.histogram()
		    .bins(bins)
		    (data);

		$.each(binned_data, function(index, value){
			// Construct X Axis of ranges
			var bin_min = Math.round(value['x'])
			if ( Math.round(value['x'] + value['dx']) != max){
				var bin_max = Math.round(value['x'] + value['dx'] - 1)
			}else{
				var bin_max = Math.round(value['x'] + value['dx'])
			};

			xAxis.push(String(bin_min + "-" + bin_max))

			// Construct data from lengths of bins
			data_buckets.push(value.length)

		});

		var hist_data = {
			buckets: data_buckets, 
			x_axis: xAxis
		};

		return hist_data;

	};

	// http://rosettacode.org/wiki/Averages/Mode#JavaScript
	function calcMode(ary) {
	    var counter = {};
	    var mode = [];
	    var max = 0;
	    for (var i in ary) {
	        if (!(ary[i] in counter))
	            counter[ary[i]] = 0;
	        counter[ary[i]]++;

	        if (counter[ary[i]] == max)
	            mode.push(ary[i]);
	        else if (counter[ary[i]] > max) {
	            max = counter[ary[i]];
	            mode = [ary[i]];
	        }
	    }
	    return mode;
	}

	function drawHighChart(hist_data){
		chart = new Highcharts.Chart({
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
		        categories: hist_data.x_axis,
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
		          data: hist_data.buckets,
				  color:'#6c0'
		      }]
		    });

	}

	function drawDescriptStats(data){

		var mean = ss.mean(data),
				median = ss.median(data),
				mode = String(calcMode(data)),
				range = d3.min(data) + '-' + d3.max(data);

		$('#mean span').html(Math.round(mean * 100) / 100);
		$('#median span').html(median);
		$('#mode span').html(mode);
		$('#range span').html(range);
	};

	var fetchNewData = function(){
		var ds = new Miso.Dataset({
		  importer : Miso.Dataset.Importers.GoogleSpreadsheet,
		  parser : Miso.Dataset.Parsers.GoogleSpreadsheet,
		  key : CONFIG.table_id,
		  worksheet : "1"//,
		  //fast: true
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

	}

	$(window).bind( 'hashchange', function(e) {
		if (window.location.hash != ''){
			var state = $.bbq.getState()
			CONFIG.table_id = state.key;
			CONFIG.column_name = state.col;
			SETTINGS.bin_or_break = state.bob;
			SETTINGS.bin_break_number = state.bbn;
		};
		fetchNewData();
	});

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
		var key = {
			l: CONFIG.table_id
		}
		$.bbq.pushState({
			'key': CONFIG.table_id,
			'col': CONFIG.column_name,
			'bob': SETTINGS.bin_or_break,
			'bbn': SETTINGS.bin_break_number
		});
	});
	$(window).trigger( 'hashchange' );
})();
