#!/usr/bin/env node

/**
 * Superheroes Model Context Protocol (MCP) Server
 * 
 * This is an MCP server that provides access to superhero data through a structured API.
 * The server loads superhero information from a JSON file and exposes it via the 
 * get_superhero tool, which allows querying superheroes by name or ID.
 * 
 * The server uses the Model Context Protocol SDK to provide a standardized interface
 * for AI assistants to query superhero data including names, images, and power statistics.
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

// Get proper __dirname equivalent in ESM
const __dirname = path.dirname(fileURLToPath(import.meta.url));

// TypeScript Interfaces

/**
 * Represents the power statistics for a superhero.
 * Each statistic is rated on a numerical scale representing the hero's abilities.
 */
interface Powerstats {
  /** Intellectual capacity and problem-solving ability */
  intelligence: number;
  /** Physical strength and lifting capacity */
  strength: number;
  /** Movement speed and reaction time */
  speed: number;
  /** Resistance to damage and ability to withstand attacks */
  durability: number;
  /** Overall supernatural/special power level */
  power: number;
  /** Fighting skills and combat expertise */
  combat: number;
}

/**
 * Represents a superhero with all their associated data.
 * Contains basic information and power statistics.
 */
interface Superhero {
  /** Unique identifier for the superhero */
  id: string | number;
  /** Display name of the superhero */
  name: string;
  /** URL to the superhero's image */
  image: string;
  /** Detailed power statistics */
  powerstats: Powerstats;
}

// Data Loading Function

/**
 * Loads superhero data from the JSON file asynchronously.
 * 
 * Reads the superheroes.json file from the data directory and parses it
 * into an array of Superhero objects. This function handles file reading
 * errors and JSON parsing errors gracefully.
 * 
 * @returns {Promise<Superhero[]>} A promise that resolves to an array of superhero objects
 * @throws {Error} Throws an error if the file cannot be read or parsed
 */
async function loadSuperheroes(): Promise<Superhero[]> {
  try {
    const data = await fs.promises.readFile(
      path.join(__dirname, "../data", "superheroes.json"),
      "utf-8"
    );
    return JSON.parse(data);
  } catch (err) {
    throw new Error(`Failed to load superheroes data: ${err instanceof Error ? err.message : String(err)}`);
  }
}

// Markdown Formatting Function

/**
 * Formats superhero data into a markdown string for display.
 * 
 * Takes a superhero object and creates a formatted markdown representation
 * including the hero's name, image, and detailed power statistics.
 * The output includes proper markdown formatting with bullet points and
 * an embedded image tag.
 * 
 * @param {Superhero} hero - The superhero object to format
 * @returns {string} A formatted markdown string representing the superhero data
 */
function formatSuperheroMarkdown(hero: Superhero): string {
  return `Here is the data for ${hero.name} retrieved using the superheroes MCP:

• Name: ${hero.name}
• Image: <img src="${hero.image}" alt="${hero.name}"/>
• Powerstats:
  • Intelligence: ${hero.powerstats.intelligence}
  • Strength: ${hero.powerstats.strength}
  • Speed: ${hero.powerstats.speed}
  • Durability: ${hero.powerstats.durability}
  • Power: ${hero.powerstats.power}
  • Combat: ${hero.powerstats.combat}`;
}

// Create MCP Server

/**
 * Initialize the Model Context Protocol server with basic configuration.
 * Sets up server metadata and declares available capabilities (resources and tools).
 */
const server = new McpServer({
  name: "superheroes-mcp",
  version: "1.0.0",
  capabilities: {
    resources: {}, // No resources exposed in this implementation
    tools: {} // Tools will be registered separately
  }
});

// Register the get_superhero tool

/**
 * Register the get_superhero tool with the MCP server.
 * 
 * This tool allows querying superhero data by either name or ID.
 * It supports case-insensitive name matching and flexible ID formats.
 * Returns formatted markdown containing all superhero information.
 */
server.registerTool(
  "get_superhero",
  {
    title: "Get Superhero",
    description: "Get superhero details by name or id",
    inputSchema: {
      name: z.string().optional().describe("Name of the superhero (optional)"),
      id: z.string().optional().describe("ID of the superhero (optional)")
    }
  },
  async ({ name, id }: { name?: string; id?: string }) => {
    // Load the superhero dataset
    const superheroes = await loadSuperheroes();
    
    // Normalize input parameters for comparison
    const nameLc = name?.toLowerCase() ?? "";
    const idStr = id ?? "";
    
    // Search for superhero by name (case-insensitive) or exact ID match
    const hero = superheroes.find(h => {
      const heroNameLc = h.name?.toLowerCase() ?? "";
      const heroIdStr = h.id?.toString() ?? "";
      
      return (name && heroNameLc === nameLc) || (id && heroIdStr === idStr);
    });
    
    // Handle case where no superhero is found
    if (!hero) {
      throw new Error("Superhero not found");
    }
    
    // Return formatted superhero data
    return {
      content: [{
        type: "text",
        text: formatSuperheroMarkdown(hero)
      }]
    };
  }
);

// Main Function

/**
 * Main entry point for the MCP server.
 * 
 * Initializes the server transport layer using stdio (standard input/output)
 * and connects the MCP server to handle incoming requests. Logs a startup
 * message to stderr to avoid interfering with the MCP protocol communication.
 * 
 * @throws {Error} Throws an error if server initialization fails
 */
async function main() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
  // Log to stderr to avoid interfering with MCP protocol on stdout
  console.error("Superhero MCP Server running on stdio");
}

// Error Handling

/**
 * Start the server with global error handling.
 * 
 * Catches any unhandled errors during server startup and logs them
 * before exiting with an error code. This ensures proper cleanup
 * and debugging information in case of startup failures.
 */
main().catch((error) => {
  console.error("Fatal error in main():", error);
  process.exit(1);
});