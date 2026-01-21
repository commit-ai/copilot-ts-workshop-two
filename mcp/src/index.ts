#!/usr/bin/env node

import path from "path";
import fs from "fs";
import { fileURLToPath } from "url";
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { z } from "zod";

// ESM __dirname workaround
const __dirname = path.dirname(fileURLToPath(import.meta.url));

// TypeScript Interfaces
interface Powerstats {
  intelligence: number;
  strength: number;
  speed: number;
  durability: number;
  power: number;
  combat: number;
}

interface Superhero {
  id: string | number;
  name: string;
  image: string;
  powerstats: Powerstats;
}

// Data Loading Function
async function loadSuperheroes(): Promise<Superhero[]> {
  try {
    const data = await fs.promises.readFile(
      path.join(__dirname, "../data/superheroes.json"),
      "utf-8"
    );
    return JSON.parse(data);
  } catch (err) {
    throw new Error(`Failed to load superheroes data: ${err instanceof Error ? err.message : String(err)}`);
  }
}

// Markdown Formatting Function
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

// MCP Server Configuration
const server = new McpServer({
  name: "superheroes-mcp",
  version: "1.0.0"
}, {
  capabilities: {
    resources: {},
    tools: {}
  }
});

// Tool Definition
server.registerTool(
  "get_superhero",
  {
    description: "Get superhero details by name or id",
    inputSchema: {
      name: z.string().optional().describe("Name of the superhero (optional)"),
      id: z.string().optional().describe("ID of the superhero (optional)")
    }
  },
  async ({ name, id }: { name?: string; id?: string }) => {
    // Load superheroes data
    const superheroes = await loadSuperheroes();
    
    // Convert name to lowercase for case-insensitive search
    const nameLc = name?.toLowerCase() ?? "";
    
    // Convert id to string for comparison
    const idStr = id ?? "";
    
    // Find superhero where either name matches or ID matches
    const hero = superheroes.find(h => {
      const heroNameLc = h.name?.toLowerCase() ?? "";
      const heroIdStr = h.id?.toString() ?? "";
      return heroNameLc === nameLc || heroIdStr === idStr;
    });
    
    if (!hero) {
      throw new Error("Superhero not found");
    }
    
    // Return formatted markdown
    return {
      content: [{
        type: "text" as const,
        text: formatSuperheroMarkdown(hero)
      }]
    };
  }
);

// Main Function
async function main() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.error("Superhero MCP Server running on stdio");
}

// Error Handling
main().catch((error) => {
  console.error("Fatal error in main():", error);
  process.exit(1);
});