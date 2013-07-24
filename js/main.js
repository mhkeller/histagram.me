(function(){
	// Reference for data
	// https://docs.google.com/spreadsheet/ccc?key=0Aoev8mClJKw_dGZ4dElNYm1CTlV6endZT095NXJZWVE#gid=0
	var SETTINGS = {
		data: null,
		bins_or_breaks: 'bins',
		bins_breaks_number: 15,
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
		var bin_info = createBinsAndXAxis(data, SETTINGS.clustering),
				data_buckets = createDataBuckets(data, bin_info.binned_data, SETTINGS.clustering);
		
		var hist_data = {
			bin_xAxis: bin_info.bin_xAxis,
			data_buckets: data_buckets
		};

		return hist_data;
	
	};

	function createDataBuckets(data, binned_data, clustering){
		var data_buckets  = _.map(binned_data, function(d) { return d.length } );
	
		return data_buckets;
	};

	function createBinsAndXAxis(data, clustering){
	  var data_min  = d3.min(data),
				data_max  = d3.max(data),
				range     = data_max - data_min,
		    bins      = calcBins(data, range),
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


	function calcBins(data, range){
		var user_bins_breaks = Number(SETTINGS.bins_breaks_number),
			  bins;


		if (SETTINGS.bins_or_breaks == 'breaks'){
			bins = range / user_bins_breaks;
		}else if (SETTINGS.bins_or_breaks == 'bins'){
			if (SETTINGS.clustering == 'even'){
				bins = user_bins_breaks;
			}else if (SETTINGS.clustering == 'jenks'){
				bins = ss.jenks(data, user_bins_breaks);
			};
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
			  mode   = String(calcMode(data).join(', ')),
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

	function clusterDropdownState(state){
		if (state == 'bins'){
			$('#cluster-controls').removeClass('disabled').find('#clustering').removeAttr('disabled');
		}else{
			$('#cluster-controls').addClass('disabled').find('#clustering').attr('disabled', 'disabled');
		};
	};

	function checkControlStates(){
		clusterDropdownState(SETTINGS.bins_or_breaks);
	};

	function updateFormEls(){
		$('#bins-breaks').val(SETTINGS.bins_breaks_number);
		$('#table-id').val(CONFIG.table_id);
		$('#column-name').val(CONFIG.column_name);
		$('#break-controls input[value="'+SETTINGS.bins_or_breaks+'"]').attr('checked', 'checked');
		$('#clustering').val(SETTINGS.clustering).attr('selected', 'selected');
	};

	function bindHandlers(){
		$('#table-id').keyup(function(){
			CONFIG.table_id = $(this).val();
		});
		$('#column-name').keyup(function(){
			CONFIG.column_name = $(this).val();
		});
		$('#break-controls input[name="binning"]').change(function(){
			var val = $(this).val();
			SETTINGS.bins_or_breaks = val;
			clusterDropdownState(val);
		});
		$('#bins-breaks').keyup(function(){
			SETTINGS.bins_breaks_number = $(this).val();
		});
		$('#clustering').change(function(){
			SETTINGS.clustering = $(this).val();
		});
		// $('#histagram-name').change(function(){
		// 	CONFIG.histagram_name = $(this).val();
		// });

		$('#submit-btn').click(function(){
			$.bbq.pushState({
				'key': CONFIG.table_id,
				'col': CONFIG.column_name,
				'bob': SETTINGS.bins_or_breaks,
				'bbn': SETTINGS.bins_breaks_number,
				'cluster': SETTINGS.clustering
			});
		});
		
		$(window).bind( 'hashchange', function(e) {
			if (window.location.hash != ''){
				var state = $.bbq.getState()
				CONFIG.table_id = state.key;
				CONFIG.column_name = state.col;
				SETTINGS.bins_or_breaks = state.bob;
				SETTINGS.bins_breaks_number = state.bbn;
				SETTINGS.clustering = state.cluster;
				updateFormEls();
			};
			checkControlStates();
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
