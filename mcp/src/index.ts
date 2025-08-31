/**
 * Superhero MCP Server
 * 
 * This module implements a Model Context Protocol (MCP) server that provides access to
 * superhero data through a standardized interface. The server exposes superhero information
 * including names, images, and power statistics, allowing clients to query and retrieve
 * detailed superhero data.
 * 
 * Features:
 * - Load superhero data from JSON file
 * - Search superheroes by name (case-insensitive) or ID
 * - Format superhero data as structured Markdown
 * - MCP-compliant tool interface for external integrations
 * 
 * The server runs on stdio transport and provides a single tool:
 * - get_superhero: Retrieve superhero details by name or ID
 * 
 * @author MCP Workshop
 * @version 1.0.0
 */

import path from "path";
import fs from "fs";
import { fileURLToPath } from "url";
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { z } from "zod";


// ESM __dirname workaround - Required for ES modules to determine the current directory
const __dirname = path.dirname(fileURLToPath(import.meta.url));


// --- Types ---

/**
 * Represents the power statistics of a superhero.
 * All values are numeric ratings typically ranging from 0-100.
 */
interface Powerstats {
  /** Intellectual capacity and problem-solving ability */
  intelligence: number;
  /** Physical strength and power */
  strength: number;
  /** Movement speed and agility */
  speed: number;
  /** Resistance to damage and endurance */
  durability: number;
  /** Overall supernatural/special abilities power level */
  power: number;
  /** Fighting skills and combat effectiveness */
  combat: number;
}


/**
 * Represents a superhero with all their associated data.
 * Contains identification, visual, and statistical information.
 */
interface Superhero {
  /** Unique identifier, can be string or number */
  id: string | number;
  /** Display name of the superhero */
  name: string;
  /** URL to the superhero's image */
  image: string;
  /** Detailed power statistics */
  powerstats: Powerstats;
}


/**
 * Loads the superheroes data from the JSON file.
 * 
 * Reads the superheroes.json file from the ../data directory relative to this module.
 * The file is expected to contain an array of superhero objects with complete data.
 * 
 * @returns Promise<Superhero[]> Array of superhero objects loaded from the JSON file
 * @throws {Error} Throws a descriptive error if file reading or JSON parsing fails
 */
async function loadSuperheroes(): Promise<Superhero[]> {
 const dataPath = path.join(__dirname, "../data/superheroes.json");
 try {
   const data = await fs.promises.readFile(dataPath, "utf8");
   return JSON.parse(data);
 } catch (err) {
   throw new Error(`Failed to load superheroes data: ${err instanceof Error ? err.message : String(err)}`);
 }
}


/**
 * Formats superhero data as a structured Markdown string.
 * 
 * Converts a superhero object into a human-readable Markdown format that includes
 * the superhero's name, image (as HTML img tag), and detailed power statistics.
 * The output is suitable for display in MCP clients or documentation.
 * 
 * @param hero - The superhero object to format
 * @returns {string} Formatted Markdown string with superhero information
 */
function formatSuperheroMarkdown(hero: Superhero): string {
 const stats = hero.powerstats;
 return [
   `Here is the data for ${hero.name} retrieved using the superheroes MCP:\n`,
   `• Name: ${hero.name}`,
   `• Image: <img src=\"${hero.image}\" alt=\"${hero.name}\"/>`,
   `• Powerstats:`,
   `  • Intelligence: ${stats.intelligence}`,
   `  • Strength: ${stats.strength}`,
   `  • Speed: ${stats.speed}`,
   `  • Durability: ${stats.durability}`,
   `  • Power: ${stats.power}`,
   `  • Combat: ${stats.combat}`
 ].join("\n");
}


// --- MCP Server Setup ---

/**
 * Create and configure the MCP server instance.
 * 
 * Initializes a new McpServer with basic metadata and empty capability declarations.
 * The capabilities will be populated when tools are registered with the server.
 */
const server = new McpServer({
 name: "superheroes-mcp",
 version: "1.0.0",
 capabilities: {
   resources: {}, // No resources exposed in this implementation
   tools: {},     // Tools will be registered below
 },
});


// --- Tool: Get Superhero by Name or ID ---

/**
 * Register the 'get_superhero' tool with the MCP server.
 * 
 * This tool allows clients to search for superheroes by either name or ID.
 * The search supports case-insensitive name matching and both string/numeric IDs.
 * Returns formatted superhero data as Markdown text.
 */
server.tool(
 "get_superhero",
 "Get superhero details by name or id",
 {
   name: z.string().describe("Name of the superhero (optional)"),
   id: z.string().describe("ID of the superhero (optional)"),
 },
 async ({ name, id }: { name: string; id: string }) => {
   const superheroes = await loadSuperheroes();
   
   // Normalize search parameters for consistent comparison
   const nameLc = name?.toLowerCase();
   const idStr = id?.toString();


   // Find superhero by name (case-insensitive) or id
   // Supports searching by either parameter, with fallback handling for missing data
   const superhero = superheroes.find((hero: Superhero) => {
     const heroNameLc = hero.name?.toLowerCase() ?? "";
     const heroIdStr = hero.id?.toString() ?? "";
     return (nameLc && heroNameLc === nameLc) || (idStr && heroIdStr === idStr);
   });


   if (!superhero) {
     throw new Error("Superhero not found");
   }


   // Return formatted superhero data as MCP text content
   return {
     content: [
       {
         type: "text",
         text: formatSuperheroMarkdown(superhero),
       },
     ],
   };
 }
);


// --- Main Entrypoint ---

/**
 * Main function to initialize and start the MCP server.
 * 
 * Sets up the stdio transport for communication with MCP clients and connects
 * the server to begin handling requests. The server will run indefinitely,
 * processing tool requests until the process is terminated.
 * 
 * @throws {Error} If server initialization or connection fails
 */
async function main() {
 // Create stdio transport for communication with MCP clients
 const transport = new StdioServerTransport();
 
 // Connect the server to the transport and start listening
 await server.connect(transport);
 
 // Log startup message to stderr (stdout is reserved for MCP protocol)
 console.error("Superhero MCP Server running on stdio");
}


// Start the server with error handling
// Any uncaught errors will be logged and cause the process to exit
main().catch((error) => {
 console.error("Fatal error in main():", error);
 process.exit(1);
});