import { Client } from "@modelcontextprotocol/sdk/client/index.js";
import { StdioClientTransport } from "@modelcontextprotocol/sdk/client/stdio.js";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const serverPath = path.join(__dirname, "../build/index.js");

async function main() {
    console.log("Starting MCP client...");

    const transport = new StdioClientTransport({
        command: "node",
        args: [serverPath],
    });

    const client = new Client(
        {
            name: "test-client",
            version: "1.0.0",
        },
        {
            capabilities: {},
        }
    );

    await client.connect(transport);
    console.log("Connected to MCP server");

    try {
        const tools = await client.listTools();
        console.log("Available tools:", tools.tools.map(t => t.name));

        console.log("\nCalling get_superhero for Ant-Man...");
        const result = await client.callTool({
            name: "get_superhero",
            arguments: { name: "Ant-Man" },
        });

        console.log("Result:");
        if (result.content && result.content[0] && result.content[0].text) {
            console.log(result.content[0].text);
        } else {
            console.log(JSON.stringify(result, null, 2));
        }

    } catch (error) {
        console.error("Error calling tool:", error);
    } finally {
        await client.close();
    }
}

main().catch(console.error);
