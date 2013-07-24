(function(){
	// Reference for data
	// https://docs.google.com/spreadsheet/ccc?key=0Aoev8mClJKw_dGZ4dElNYm1CTlV6endZT095NXJZWVE#gid=0
	var SETTINGS = {
		data: null,
		binning: 'jenks',
		bins_breaks_number: 15
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
		var bin_info = createBinsAndXAxis(data, SETTINGS.binning),
				data_buckets = createDataBuckets(data, bin_info.binned_data, SETTINGS.binning);
		
		var hist_data = {
			bin_xAxis: bin_info.bin_xAxis,
			data_buckets: data_buckets
		};

		return hist_data;
	
	};

	function createDataBuckets(data, binned_data, binning){
		var data_buckets  = _.map(binned_data, function(d) { return d.length } );
	
		return data_buckets;
	};

	function createBinsAndXAxis(data, binning){
	  var data_min  = d3.min(data),
				data_max  = d3.max(data),
				range     = data_max - data_min,
		    bins      = calcBins(data, range, data_min, data_max),
				bin_xAxis = [],
				binned_data,
				bin_min,
				bin_max;


		binned_data = d3.layout.histogram()
		    .bins(bins)
		    (data);

		$.each(binned_data, function(index, value){

			bin_min = rounderToNPlaces(value['x'], 2);
			bin_max = '<' + rounderToNPlaces(value['x'] + value['dx'], 2);

			if (value['x'] == data_min){
				bin_min = rounderToNPlaces(value['x'], 2);
			};

			bin_xAxis.push(String(bin_min + ' to ' + bin_max));

		});

		var bin_info = {
			binned_data: binned_data,
			bin_xAxis: bin_xAxis
		};

		return bin_info;

	};


	function calcBins(data, range, data_min, data_max){
		var user_bins_breaks = Number(SETTINGS.bins_breaks_number),
			  bins;

		if (SETTINGS.binning == 'even'){
			bins = user_bins_breaks;
		}else if (SETTINGS.binning == 'jenks'){
			bins = ss.jenks(data, user_bins_breaks);
		}else if (SETTINGS.binning == 'head-tail'){
			bins = stats.headTail(data, data_min, data_max);
		}else if (SETTINGS.binning == 'custom-breaks'){
			bins = _.map(SETTINGS.bins_breaks_number.split(','), function (d) { return parseInt(d)} )
		}else if (SETTINGS.binning == 'custom-interval'){
			bins = range / user_bins_breaks;
		};

		return bins;
	};

	var stats = {
		mode: function(ary){
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
		},
		headTail: function(arr, data_min, data_max){
			var mean = ss.mean(arr),
					bins = [data_min];

			while (arr.length > 1){
				arr = _.filter(arr, function(d) { return d > mean } );
				mean = ss.mean(arr);
				bins.push(mean)
			};

			return bins;
		}
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
        x: -18,
		 		style: {
					color: '#303030',
					font: 'normal 16px "Arial", sans-serif'
				}//center
      },
      subtitle: {
        text: '',
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
			  mode   = String(stats.mode(data).join(', ')),
			  range  = d3.min(data) + '-' + d3.max(data);

		$('#mean span').html(Math.round(mean * 100) / 100);
		$('#median span').html(median);
		$('#mode span').html(mode);
		$('#range span').html(range);
	};

	function fetchData(){
		var ds = new Miso.Dataset({
			// url: 'data/dummy-data.csv',
			// delimiter: ','
		  importer : Miso.Dataset.Importers.GoogleSpreadsheet,
		  parser : Miso.Dataset.Parsers.GoogleSpreadsheet,
		  key : CONFIG.table_id,
		  worksheet : "1"
		});

		ds.fetch({
		  success : function() {
		  	var data = this.column(CONFIG.column_name).data;
		  	createHistogram(data);
		  },
		  error : function() {
		  }
		});
	};

	function createHistogram(data){
		try{
	  	constructHistDataDrawChart(data);
	  	drawDescriptStats(data);
		}
		catch(err){
			alert("Error: Try selecting fewer bins or smaller breaks.")
		}
	};

	function setBinsBreaksNumberLabel(val){
		$label = $('#bins_breaks_number_label')
		if (val == 'jenks' || val == 'even'){
			$label.html('How many bins?')
		}else if (val == 'custom-breaks'){
			$label.html('Enter your thresholds, min and max included. e.g. 1, 4, 12, 99')
		}else if (val == 'custom-interval'){
			$label.html('Break every...')
		}
	};

	function updateFormEls(){
		$('#bins-breaks').val(SETTINGS.bins_breaks_number);
		$('#table-id').val(CONFIG.table_id);
		$('#column-name').val(CONFIG.column_name);
		$('#binning').val(SETTINGS.binning).attr('selected', 'selected');
		setBinsBreaksNumberLabel(SETTINGS.binning);
	};

	function bindHandlers(){
		$('#table-id').keyup(function(){
			CONFIG.table_id = $(this).val();
		});
		$('#column-name').keyup(function(){
			CONFIG.column_name = $(this).val();
		});
		$('#bins-breaks').keyup(function(){
			SETTINGS.bins_breaks_number = $(this).val();
		});
		$('#binning').change(function(){
			var val = $(this).val();
			SETTINGS.binning = val;
			setBinsBreaksNumberLabel(val);
		});
		// $('#histagram-name').change(function(){
		// 	CONFIG.histagram_name = $(this).val();
		// });

		$('#submit-btn').click(function(){
			$.bbq.pushState({
				'key': CONFIG.table_id,
				'col': CONFIG.column_name,
				'bbn': SETTINGS.bins_breaks_number,
				'binning': SETTINGS.binning
			});
		});
		
		$(window).bind( 'hashchange', function(e) {
			if (window.location.hash != ''){
				var state = $.bbq.getState()
				CONFIG.table_id = state.key;
				CONFIG.column_name = state.col;
				SETTINGS.bins_breaks_number = state.bbn;
				SETTINGS.binning = state.binning;
			};
			updateFormEls();
			loadData();
		});
	};

	function loadData(){
		if (SETTINGS.data == null){
			fetchData();
		}else{
			createHistogram(SETTINGS.data)
		};
	};

	function startTheShow(){
		bindHandlers();
		$(window).trigger( 'hashchange' );
	};

	startTheShow();

})();
