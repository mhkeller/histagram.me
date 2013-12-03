<h1>Histagram.me</h1>
<h4>An interactive histogram maker using Google Spreadsheets, Highcharts.js, and D3.js</h4>
<p>Live app: <a href="http://www.histagram.me" target="_blank">http://histagram.me</a></p>
<p>Sample Spreadsheet: <a href="https://docs.google.com/spreadsheet/ccc?key=0Aoev8mClJKw_dGZ4dElNYm1CTlV6endZT095NXJZWVE#gid=0" target="_blank">https://docs.google.com/spreadsheet/ccc?key=0Aoev8mClJKw_dGZ4dElNYm1CTlV6endZT095NXJZWVE#gid=0</a></p>
<h4>How to:</h4>
<ol>
	<li>Put your data into a Google Spreadsheet.</li>
	<li>Go to File > Publish to the Web.</li>
	<li>Copy the key i.e. 0Aoev8mClJKw_dGZ4dElNYm1CTlV6endZT095NXJZWVE.</li>
	<li>Paste that into the textfield, enter the column name that holds your data and hit the button.</li>
</ol>
<h4>Options</h4>
<ul>
  <li> <a href="http://en.wikipedia.org/wiki/Jenks_natural_breaks_optimization" target="_blank"><code>Jenks natural breaks</code></a> will take the number of bins you set and determine breaks that maximize similarity within bins and difference between bins. <a href="http://en.wikipedia.org/wiki/Jenks_natural_breaks_optimization" target="_blank">Jenks natural breaks</a> is used mainly for cartography.</li>
  <li> <code>Even bins</code> will take the number of bins you set and make them equally spaced along your data.</li>
  <li> <code>Custom breaks</code> takes a list of comma-separated threshold values to define custom break points. Start with the minimum value in your data and ending with the maximum value such as <code>1, 10, 24, 66, 99</code> with <code>1</code> and <code>99</code> the min and max, respectively. These are parsed with <code>parseInt</code> so you can include a space for readability.</li>
  <li> <code>Custom interval</code> will make a bin every n units along your data. If you put in a super high number then this might be slow to draw.</li>
</ul>

#### Running it locally

* Clone the repo with `git clone https://github.com/mhkeller/histagram.me.git`
* `cd histagram.me` 
* Then `python -m SimpleHTTPServer 8000`
* Go to `http://0.0.0.0:8000` in your browser.

<h4>Contact</h4>
<p><strong>By:</strong> <a href="http://www.twitter.com/mhkeller" target="_blank">@mhkeller</a></p>
<p>Logo + domain support by <a href="http://github.com/abelsonlive" target="_blank">Brian Abelson</a></p>
