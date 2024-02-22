const chromium = require('chrome-aws-lambda');

exports.handler = async (event, context) => {
    // Extract query parameter
    const data = event.queryStringParameters.data || 'Default data if none provided';

    // Setup Puppeteer
    const browser = await chromium.puppeteer.launch({
        args: chromium.args,
        defaultViewport: chromium.defaultViewport,
        executablePath: await chromium.executablePath,
        headless: chromium.headless,
        ignoreHTTPSErrors: true,
    });

    const page = await browser.newPage();

    // Your page content setup goes here, including VexFlow initialization
    // Replace this HTML with your actual HTML setup for VexFlow
    await page.setContent(`
       <!DOCTYPE html>
        <html>
        <body>
            <div id="output" ></div>
            <script src="https://cdn.jsdelivr.net/npm/vexflow@4.0.1/build/cjs/vexflow.js"></script>
            <script>
            // Initialize VexFlow and render notation
            // Example: var vf = new Vex.Flow.Factory({renderer: {elementId: 'notation', width: 500, height: 200}});
            // You would replace the following line with your VexFlow initialization code, using the 'data' variable
            

            const {
                Renderer,
                Beam,
                Stave,
                Formatter,
                StaveNote,
                Accidental,
                StaveLine
              } = Vex.Flow;
      
              // Create an SVG renderer and attach it to the DIV element with id="output".
              const div = document.getElementById('output');
              const renderer = new Renderer(div, Renderer.Backends.SVG);
              const scale = 2;
              
              // Configure the rendering context.
              renderer.resize(161 * scale, 110 * scale);
              const context = renderer.getContext();
              context.setFont('Arial', 10);
              context.scale(scale, scale);
      
              // Create a stave of width 400 at position 10, 40.
              const stave = new Stave(10, -5, 150);
      
              // Add a clef and time signature.
              stave.addClef('treble');
      
              // Connect it to the rendering context and draw!
              stave.setContext(context).draw();
      
      
              const notes = [
                new StaveNote({
                  keys: ['bb/4'],
                  duration: 'h'
                }).addModifier(new Accidental('b')),
                new StaveNote({
                  keys: ['g/5'],
                  duration: 'h'
                })
              ];
      
              const beams = Beam.generateBeams(notes);
              Formatter.FormatAndDraw(context, stave, notes);
      
      
              const lines =  [
                new StaveLine({
                  first_note: notes[0],
                  last_note: notes[1],
                  first_indices: [0],
                  last_indices: [0],
                })
              ];
      
      
              lines.forEach((l) => {
                l.setContext(context).draw()
              });
            
            </script>
        </body>
        </html>
    `);

    // Puppeteer operations to capture the screenshot
    const imageBuffer = await page.screenshot({
        type: 'png', // Specify the image type ('png' or 'jpeg')
        fullPage: false, // Set to true to capture the entire page
        clip: { x: 8, y: 8, width: 342, height: 224 },
        //clip: { x: 8, y: 8, width: 302, height: 224 }, //use to cut image to barlines with no side padding.
        //vexflow bounds are from barline to barline. new Stave of width 150 is actually 320 (when staff is resized x2)
    });

    await browser.close();

    // Return the image as a response
    return {
        statusCode: 200,
        headers: { 'Content-Type': 'image/png' },
        body: imageBuffer.toString('base64'),
        isBase64Encoded: true,
    };
};
