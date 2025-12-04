import express, { json } from 'express';
import Docker from 'dockerode';
import { join } from 'path';

const app = express();
const docker = new Docker();

const PORT = process.env.PORT || 3000;
const SCRIPTS_PATH = join(process.cwd(), 'scripts');
const IMAGE_NAME = 'python:3.11-slim';

app.use(json());

function pullImage(image) {
    return new Promise((resolve, reject) => {
        docker.pull(image, (err, stream) => {
            if (err) return reject(err);
            docker.modem.followProgress(stream, (err, output) => {
                if (err) return reject(err);
                resolve(output);
            });
        });
    });
}

// Shared function to spin up containers
async function spinContainersSequential(number) {
    const results = [];

    // Pull the Python image first (if not already available)
    console.log('Pulling Python image...');
    await pullImage(IMAGE_NAME);
    console.log('Python image ready.');

    // Spin up the specified number of containers
    for (let i = 1; i <= number; i++) {
        console.log(`Creating container ${i}...`);

        const container = await docker.createContainer({
            Image: IMAGE_NAME,
            Cmd: ['python', '/scripts/hello.py'],
            Env: [`CONTAINER_NUMBER=${i}`],
            HostConfig: {
                Binds: [`${SCRIPTS_PATH}:/scripts:ro`]
            },
            name: `hello-container-${i}-${Date.now()}`
        });

        // Start the container
        await container.start();

        // Wait for the container to finish
        await container.wait();

        // Get logs after container has stopped
        const logs = await container.logs({
            stdout: true,
            stderr: true
        });

        const output = logs.toString('utf8').replace(/[^\x20-\x7E\n]/g, '').trim();
        results.push({
            containerNumber: i,
            output: output
        });

        console.log(`Container ${i} completed: ${output}`);

        // Remove the container after getting logs
        await container.remove();
    }

    return results;
}

// Function to spin up containers in parallel
async function spinContainersParallel(number) {
    // Pull the Python image first (if not already available)
    console.log('Pulling Python image...');
    await pullImage(IMAGE_NAME);
    console.log('Python image ready.');

    // Create array of promises for parallel execution
    const containerPromises = [];

    for (let i = 1; i <= number; i++) {
        const promise = (async (containerNum) => {
            console.log(`Creating container ${containerNum}...`);

            const container = await docker.createContainer({
                Image: IMAGE_NAME,
                Cmd: ['python', '/scripts/hello.py'],
                Env: [`CONTAINER_NUMBER=${containerNum}`],
                HostConfig: {
                    Binds: [`${SCRIPTS_PATH}:/scripts:ro`]
                },
                name: `hello-container-${containerNum}-${Date.now()}`
            });

            // Start the container
            await container.start();
           // Wait for the container to finish
            await container.wait();

            // Get logs after container has stopped
            const logs = await container.logs({
                stdout: true,
                stderr: true
            });

            const output = logs.toString('utf8').replace(/[^\x20-\x7E\n]/g, '').trim();

            console.log(`Container ${containerNum} completed: ${output}`);

            // Remove the container after getting logs
            await container.remove();

            return {
                containerNumber: containerNum,
                output: output
            };
        })(i);

        containerPromises.push(promise);
    }

    // Execute all container operations in parallel
    const results = await Promise.all(containerPromises);

    return results;
}

// API endpoint to spin up containers (POST)
app.post('/containers', async (req, res) => {
    const { number } = req.body;

    if (!number || typeof number !== 'number' || number < 1) {
        return res.status(400).json({
            error: 'Invalid parameter. Please provide a positive number.'
        });
    }

    try {
        const results = await spinContainersSequential(number);
        res.json({
            success: true,
            containersSpun: number,
            results: results
        });
    } catch (error) {
        console.error('Error:', error);
        res.status(500).json({
            error: 'Failed to create containers',
            details: error.message
        });
    }
});

// GET endpoint for convenience
app.get('/containers/:number', async (req, res) => {
    const number = parseInt(req.params.number, 10);

    if (isNaN(number) || number < 1) {
        return res.status(400).json({
            error: 'Invalid parameter. Please provide a positive number.'
        });
    }

    try {
        const results = await spinContainers(number);
        res.json({
            success: true,
            containersSpun: number,
            results: results
        });
    } catch (error) {
        console.error('Error:', error);
        res.status(500).json({
            error: 'Failed to create containers',
            details: error.message
        });
    }
});

// API endpoint to spin up containers in parallel (POST)
app.post('/containers/parallel', async (req, res) => {
    const { number } = req.body;

    if (!number || typeof number !== 'number' || number < 1) {
        return res.status(400).json({
            error: 'Invalid parameter. Please provide a positive number.'
        });
    }

    try {
        const startTime = Date.now();
        const results = await spinContainersParallel(number);
        const endTime = Date.now();

        res.json({
            success: true,
            mode: 'parallel',
            containersSpun: number,
            executionTime: `${endTime - startTime}ms`,
            results: results
        });
    } catch (error) {
        console.error('Error:', error);
        res.status(500).json({
            error: 'Failed to create containers in parallel',
            details: error.message
        });
    }
});

// GET endpoint for parallel execution
app.get('/containers/parallel/:number', async (req, res) => {
    const number = parseInt(req.params.number, 10);

    if (isNaN(number) || number < 1) {
        return res.status(400).json({
            error: 'Invalid parameter. Please provide a positive number.'
        });
    }

    try {
        const startTime = Date.now();
        const results = await spinContainersParallel(number);
        const endTime = Date.now();

        res.json({
            success: true,
            mode: 'parallel',
            containersSpun: number,
            executionTime: `${endTime - startTime}ms`,
            results: results
        });
    } catch (error) {
        console.error('Error:', error);
        res.status(500).json({
            error: 'Failed to create containers in parallel',
            details: error.message
        });
    }
});

// Health check endpoint
app.get('/health', (req, res) => {
    res.json({ status: 'ok' });
});

app.listen(PORT, () => {
    console.log(`DockerRunner API server running on port ${PORT}`);
    console.log(`\nSequential execution:`);
    console.log(`  POST /containers with body { "number": N } to spin up N containers`);
    console.log(`  GET /containers/:number to spin up N containers`);
    console.log(`\nParallel execution:`);
    console.log(`  POST /containers/parallel with body { "number": N } to spin up N containers in parallel`);
    console.log(`  GET /containers/parallel/:number to spin up N containers in parallel`);
});
