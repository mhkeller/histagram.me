(function(){
	// Reference for data
	// https://docs.google.com/spreadsheet/ccc?key=0Aoev8mClJKw_dGZ4dElNYm1CTlV6endZT095NXJZWVE#gid=0
	var SETTINGS = {
		bin_or_break: 'break',
		bin_break_number: 5,
		transform_function: 'raw'
	}

	var CONFIG = {
		table_id: '0Aoev8mClJKw_dGZ4dElNYm1CTlV6endZT095NXJZWVE',
		y_axis_label: 'Count',
		miso_obj: null,
		data: null
	}

	var VALUES = {
		mean: null,
		median: null,
		mode: null,
		range: null
	}



	var xAxis = [];
	var constructHistData = function(){
		xAxis =[];
		var dataBuckets = [];
	    var numbers = CONFIG.miso_obj.column("data").data;
		var dataMax = CONFIG.miso_obj.max("data");
		var dataMin = CONFIG.miso_obj.min("data");
		if (SETTINGS.bin_or_break == 'break'){
			var bins = dataMax/SETTINGS.bin_break_number;
		}else{
			var bins = Number(SETTINGS.bin_break_number);
		}

		// Generate a histogram using n uniformly-spaced bins.
		var data = d3.layout.histogram()
		    .bins(bins)
		    (numbers);
		$.each(data,function(index, value){
			// Construct X Axis of ranges
			var binMin = Math.round(value['x'])
			if ( Math.round(value['x'] + value['dx']) != dataMax){
				var binMax = Math.round(value['x'] + value['dx'] - 1)
			}else{
				var binMax = Math.round(value['x'] + value['dx'])
			}
			xAxis.push(String(binMin + "-" + binMax))
			
			// Construct data from lengths of bins
			dataBuckets.push(value.length)
			
		});
		CONFIG.data = dataBuckets;

		// Get Mean, median, mode, and range
		// Mean
		VALUES.mean = CONFIG.miso_obj.sum('data')/(numbers.length)
		VALUES.median = median(numbers);
		VALUES.mode = String(mode(numbers));
		VALUES.range = dataMin + ' - ' + dataMax;
	}

	// http://caseyjustus.com/finding-the-median-of-an-array-with-javascript
	function median(values) {
 
	    values.sort( function(a,b) {return a - b;} );
	 
	    var half = Math.floor(values.length/2);
	 
	    if(values.length % 2)
	        return values[half];
	    else
	        return (values[half-1] + values[half]) / 2.0;
	}

	// http://rosettacode.org/wiki/Averages/Mode#JavaScript
	function mode(ary) {
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

	var drawHighChart = function(){
		chart = new Highcharts.Chart({
		      chart: {
		        renderTo: 'chart-container',
		        type: 'column',
		        marginRight: 0,
		        marginBottom: 50
		      },
		      title: {
		        text: 'Histogram',
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
		        categories: xAxis,
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
		          return 'Count in group: ' + this.y + "<br/>Range:" + this.x;
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
		          data: CONFIG.data,
				  color:'#6c0'
		      }]
		    });
		
	}

	var drawDescriptStats = function(){
		$('#mean span').html(Math.round(VALUES.mean*100)/100);
		$('#median span').html(VALUES.median);
		$('#mode span').html(VALUES.mode);
		$('#range span').html(VALUES.range);
	}

	var fetchNewData = function(){
		var ds = new Miso.Dataset({
		  importer : Miso.Importers.GoogleSpreadsheet,
		  parser : Miso.Parsers.GoogleSpreadsheet,
		  key : CONFIG.table_id,
		  worksheet : "1"
		});

		ds.fetch({ 
		  success : function() {
		  	CONFIG.miso_obj = this;
		  	constructHistData();
		  	drawHighChart();
		  	drawDescriptStats();
			// Begin Highcharts
			
		  },
		  error : function() {
		  }
		});
		
	}

	fetchNewData();
	$('#break-controls input').change(function(){
		SETTINGS.bin_or_break = $(this).val();
	});
	$('#bins-breaks').change(function(){
		SETTINGS.bin_break_number = $(this).val();
	});
	$('#table-id').change(function(){
		CONFIG.table_id = $(this).val();
	});
	$('#submit-btn').click(function(){
		fetchNewData();
	});
})();