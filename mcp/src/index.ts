/**
 * Superheroes MCP Server
 * 
 * This is a Model Context Protocol (MCP) server implementation that provides access to superhero data.
 * The server enables AI assistants to query and retrieve information about superheroes including their
 * names, images, power statistics, and other attributes stored in a JSON data file.
 * 
 * The MCP server implements the following capabilities:
 * - Resource discovery for superhero data
 * - Tools for searching and retrieving superhero information
 * - Prompts for generating superhero-related content
 * 
 * Data Source: superheroes.json containing superhero profiles with power statistics
 * 
 * @author Workshop Participant
 * @version 1.0.0
 */

import { Server } from '@modelcontextprotocol/sdk/server';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import {
  CallToolRequestSchema,
  ErrorCode,
  ListResourcesRequestSchema,
  ListToolsRequestSchema,
  McpError,
  ReadResourceRequestSchema,
} from '@modelcontextprotocol/sdk/types.js';
import { z } from 'zod';
import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

// Get proper __dirname equivalent in ESM modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/**
 * Superhero data structure validation schema using Zod
 * Defines the expected structure for superhero objects in the JSON data
 */
const SuperheroSchema = z.object({
  id: z.number(),
  name: z.string(),
  image: z.string().url(),
  powerstats: z.object({
    intelligence: z.number(),
    strength: z.number(),
    speed: z.number(),
    durability: z.number(),
    power: z.number(),
    combat: z.number(),
  }),
});

/**
 * Type definition for a single superhero based on the validation schema
 */
type Superhero = z.infer<typeof SuperheroSchema>;

/**
 * Loads superhero data from the JSON file and validates the structure
 * 
 * @returns {Promise<Superhero[]>} Array of validated superhero objects
 * @throws {McpError} If the file cannot be read or data is invalid
 */
async function loadSuperheroes(): Promise<Superhero[]> {
  try {
    // Construct path to the superheroes data file relative to the source directory
    const dataPath = path.join(__dirname, '../data/superheroes.json');
    
    // Read and parse the JSON data asynchronously
    const data = await fs.readFile(dataPath, 'utf-8');
    const rawData = JSON.parse(data);
    
    // Validate the data structure using Zod schema
    const heroesArray = z.array(SuperheroSchema);
    return heroesArray.parse(rawData);
  } catch (error) {
    // Transform file system or parsing errors into MCP errors
    throw new McpError(
      ErrorCode.InternalError,
      `Failed to load superheroes data: ${error instanceof Error ? error.message : String(error)}`
    );
  }
}

/**
 * Finds a superhero by their unique identifier
 * 
 * @param {Superhero[]} superheroes - Array of all superheroes to search
 * @param {number|string} id - The superhero ID to search for (accepts string for flexibility)
 * @returns {Superhero|undefined} The matching superhero or undefined if not found
 */
function findSuperheroById(superheroes: Superhero[], id: number | string): Superhero | undefined {
  const numericId = typeof id === 'string' ? parseInt(id, 10) : id;
  return superheroes.find(hero => hero.id === numericId);
}

/**
 * Finds a superhero by their name (case-insensitive search)
 * 
 * @param {Superhero[]} superheroes - Array of all superheroes to search
 * @param {string} name - The superhero name to search for
 * @returns {Superhero|undefined} The matching superhero or undefined if not found
 */
function findSuperheroByName(superheroes: Superhero[], name: string): Superhero | undefined {
  const normalizedName = name.toLowerCase().trim();
  return superheroes.find(hero => hero.name.toLowerCase() === normalizedName);
}

/**
 * Formats a superhero's data as a markdown string for display
 * 
 * @param {Superhero} hero - The superhero object to format
 * @returns {string} Formatted markdown representation of the superhero
 */
function formatSuperheroMarkdown(hero: Superhero): string {
  return `# ${hero.name}

![${hero.name}](${hero.image})

## Power Statistics
- **Intelligence**: ${hero.powerstats.intelligence}
- **Strength**: ${hero.powerstats.strength}
- **Speed**: ${hero.powerstats.speed}
- **Durability**: ${hero.powerstats.durability}
- **Power**: ${hero.powerstats.power}
- **Combat**: ${hero.powerstats.combat}

*Data retrieved using the Superheroes MCP Server*`;
}

/**
 * Creates and configures the MCP server instance with all necessary handlers
 * 
 * @returns {Server} Configured MCP server ready to handle requests
 */
function createServer(): Server {
  const server = new Server(
    {
      name: 'superheroes-mcp',
      version: '1.0.0',
    },
    {
      capabilities: {
        resources: {},
        tools: {},
      },
    }
  );

  /**
   * Handler for listing available resources
   * Provides information about the superhero data resource
   */
  server.setRequestHandler(ListResourcesRequestSchema, async () => {
    return {
      resources: [
        {
          uri: 'superheroes://data',
          mimeType: 'application/json',
          name: 'Superhero Database',
          description: 'Complete database of superhero information including power statistics',
        },
      ],
    };
  });

  /**
   * Handler for reading resource content
   * Returns the actual superhero data when requested
   */
  server.setRequestHandler(ReadResourceRequestSchema, async (request) => {
    const { uri } = request.params;
    
    if (uri === 'superheroes://data') {
      try {
        const superheroes = await loadSuperheroes();
        return {
          contents: [
            {
              uri,
              mimeType: 'application/json',
              text: JSON.stringify(superheroes, null, 2),
            },
          ],
        };
      } catch (error) {
        // Re-throw MCP errors or wrap unknown errors
        if (error instanceof McpError) {
          throw error;
        }
        throw new McpError(ErrorCode.InternalError, `Failed to read resource: ${String(error)}`);
      }
    }
    
    // Handle unknown resource URIs
    throw new McpError(ErrorCode.InvalidRequest, `Unknown resource: ${uri}`);
  });

  /**
   * Handler for listing available tools
   * Defines the search and formatting tools available to AI assistants
   */
  server.setRequestHandler(ListToolsRequestSchema, async () => {
    return {
      tools: [
        {
          name: 'find_superhero_by_id',
          description: 'Find a specific superhero by their unique ID number',
          inputSchema: {
            type: 'object',
            properties: {
              id: {
                type: 'string',
                description: 'The superhero ID to search for',
              },
            },
            required: ['id'],
          },
        },
        {
          name: 'find_superhero_by_name',
          description: 'Find a superhero by their name (case-insensitive)',
          inputSchema: {
            type: 'object',
            properties: {
              name: {
                type: 'string',
                description: 'The superhero name to search for',
              },
            },
            required: ['name'],
          },
        },
        {
          name: 'list_all_superheroes',
          description: 'Get a list of all available superheroes with their basic information',
          inputSchema: {
            type: 'object',
            properties: {},
          },
        },
      ],
    };
  });

  /**
   * Handler for tool execution requests
   * Implements the actual search and data retrieval functionality
   */
  server.setRequestHandler(CallToolRequestSchema, async (request) => {
    const { name, arguments: args } = request.params;
    
    try {
      // Load superhero data for all tool operations
      const superheroes = await loadSuperheroes();
      
      switch (name) {
        case 'find_superhero_by_id': {
          const { id } = args as { id: string };
          const hero = findSuperheroById(superheroes, id);
          
          if (!hero) {
            return {
              content: [
                {
                  type: 'text',
                  text: `No superhero found with ID: ${id}`,
                },
              ],
            };
          }
          
          return {
            content: [
              {
                type: 'text',
                text: formatSuperheroMarkdown(hero),
              },
            ],
          };
        }
        
        case 'find_superhero_by_name': {
          const { name: heroName } = args as { name: string };
          const hero = findSuperheroByName(superheroes, heroName);
          
          if (!hero) {
            return {
              content: [
                {
                  type: 'text',
                  text: `No superhero found with name: ${heroName}`,
                },
              ],
            };
          }
          
          return {
            content: [
              {
                type: 'text',
                text: formatSuperheroMarkdown(hero),
              },
            ],
          };
        }
        
        case 'list_all_superheroes': {
          // Create a summary list of all superheroes
          const summary = superheroes.map(hero => 
            `- **${hero.name}** (ID: ${hero.id}) - Intelligence: ${hero.powerstats.intelligence}, Strength: ${hero.powerstats.strength}`
          ).join('\n');
          
          return {
            content: [
              {
                type: 'text',
                text: `# All Superheroes\n\n${summary}\n\n*Use find_superhero_by_id or find_superhero_by_name for detailed information*`,
              },
            ],
          };
        }
        
        default:
          // Handle unknown tool names
          throw new McpError(ErrorCode.MethodNotFound, `Unknown tool: ${name}`);
      }
    } catch (error) {
      // Ensure all errors are properly formatted as MCP errors
      if (error instanceof McpError) {
        throw error;
      }
      throw new McpError(ErrorCode.InternalError, `Tool execution failed: ${String(error)}`);
    }
  });

  return server;
}

/**
 * Main entry point for the MCP server
 * Sets up the server, transport, and starts listening for requests
 */
async function main(): Promise<void> {
  try {
    // Create the MCP server instance
    const server = createServer();
    
    // Set up stdio transport for communication with the MCP client
    const transport = new StdioServerTransport();
    
    // Connect the server to the transport and start processing requests
    await server.connect(transport);
    
    // Log successful startup (this will go to stderr, not interfering with MCP protocol)
    console.error('Superheroes MCP Server started successfully');
  } catch (error) {
    // Log startup errors and exit with error code
    console.error('Failed to start MCP server:', error);
    process.exit(1);
  }
}

// Start the server only when this file is run directly (not when imported)
if (import.meta.url === `file://${process.argv[1]}`) {
  main().catch((error) => {
    console.error('Unhandled error in main:', error);
    process.exit(1);
  });
}