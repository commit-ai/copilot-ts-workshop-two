#!/usr/bin/env node

/**
 * Superheroes MCP Server
 * 
 * This file implements a Model Context Protocol (MCP) server that provides access to superhero data.
 * The server exposes tools and resources that allow MCP clients to search for and retrieve information
 * about superheroes including their names, images, and power statistics.
 * 
 * Features:
 * - Search superheroes by name (case-insensitive partial matching)
 * - Retrieve superhero information by ID
 * - Access comprehensive superhero data including power statistics
 * - Formatted markdown output for enhanced readability
 * 
 * The superhero data is loaded from a local JSON file containing information about various
 * superheroes including their intelligence, strength, speed, durability, power, and combat stats.
 * 
 * @fileoverview MCP server providing superhero data access and search capabilities
 * @author Copilot Workshop
 * @version 1.0.0
 */

import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import {
  CallToolRequestSchema,
  ErrorCode,
  ListToolsRequestSchema,
  McpError,
} from '@modelcontextprotocol/sdk/types.js';
import { z } from 'zod';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

// ESM module path resolution for proper file handling in Node.js modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/**
 * Superhero data structure schema for type validation
 * Defines the expected structure of superhero data loaded from JSON
 */
const SuperheroSchema = z.object({
  id: z.number(),
  name: z.string(),
  image: z.string(),
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
 * In-memory cache for superhero data to avoid repeated file system reads
 * Loaded once on first access and reused for subsequent requests
 */
let superheroesCache: Superhero[] | null = null;

/**
 * Loads superhero data from the JSON file and validates the structure.
 * Implements caching to improve performance by avoiding repeated file reads.
 * 
 * @returns {Promise<Superhero[]>} Promise that resolves to an array of validated superhero objects
 * @throws {McpError} When file cannot be read or data validation fails
 */
async function loadSuperheroes(): Promise<Superhero[]> {
  // Return cached data if already loaded to improve performance
  if (superheroesCache !== null) {
    return superheroesCache;
  }

  try {
    // Construct path to the superhero data file relative to the script location
    const dataPath = path.join(__dirname, '../data/superheroes.json');
    
    // Read the JSON file asynchronously for better performance
    const data = await fs.promises.readFile(dataPath, 'utf-8');
    const rawData = JSON.parse(data);

    // Validate that the data is an array and each item matches the superhero schema
    if (!Array.isArray(rawData)) {
      throw new McpError(ErrorCode.InternalError, 'Superhero data must be an array');
    }

    // Validate each superhero object against the schema to ensure data integrity
    const validatedData = rawData.map((item, index) => {
      try {
        return SuperheroSchema.parse(item);
      } catch (validationError) {
        throw new McpError(
          ErrorCode.InternalError,
          `Invalid superhero data at index ${index}: ${validationError}`
        );
      }
    });

    // Cache the validated data for future requests
    superheroesCache = validatedData;
    return validatedData;
  } catch (error) {
    // Handle file system errors and re-throw as MCP errors with appropriate context
    if (error instanceof McpError) {
      throw error;
    }
    throw new McpError(
      ErrorCode.InternalError,
      `Failed to load superhero data: ${error instanceof Error ? error.message : String(error)}`
    );
  }
}

/**
 * Searches for superheroes by name using case-insensitive partial matching.
 * This function implements fuzzy search capabilities to help users find superheroes
 * even with partial or slightly incorrect name inputs.
 * 
 * @param {string} query - The search query (superhero name or partial name)
 * @returns {Promise<Superhero[]>} Promise that resolves to an array of matching superheroes
 * @throws {McpError} When superhero data cannot be loaded
 */
async function searchSuperheroesByName(query: string): Promise<Superhero[]> {
  const superheroes = await loadSuperheroes();
  
  // Convert query to lowercase for case-insensitive matching
  const lowerQuery = query.toLowerCase().trim();
  
  // Filter superheroes by partial name matching (case-insensitive)
  return superheroes.filter(hero => 
    hero.name.toLowerCase().includes(lowerQuery)
  );
}

/**
 * Retrieves a specific superhero by their unique identifier.
 * Provides direct access to superhero data when the exact ID is known.
 * 
 * @param {number} id - The unique identifier of the superhero
 * @returns {Promise<Superhero | null>} Promise that resolves to the superhero object or null if not found
 * @throws {McpError} When superhero data cannot be loaded
 */
async function getSuperheroById(id: number): Promise<Superhero | null> {
  const superheroes = await loadSuperheroes();
  
  // Find superhero with matching ID (convert to number for comparison safety)
  return superheroes.find(hero => hero.id === id) || null;
}

/**
 * Formats superhero data into readable markdown format for enhanced presentation.
 * Creates a structured, human-readable output that includes all relevant superhero
 * information in a consistent format.
 * 
 * @param {Superhero} hero - The superhero object to format
 * @returns {string} Markdown-formatted string representation of the superhero data
 */
function formatSuperheroMarkdown(hero: Superhero): string {
  return `## ${hero.name}

![${hero.name}](${hero.image})

### Power Statistics
- **Intelligence**: ${hero.powerstats.intelligence}/100
- **Strength**: ${hero.powerstats.strength}/100  
- **Speed**: ${hero.powerstats.speed}/100
- **Durability**: ${hero.powerstats.durability}/100
- **Power**: ${hero.powerstats.power}/100
- **Combat**: ${hero.powerstats.combat}/100

### Overall Power Rating
${Math.round((hero.powerstats.intelligence + hero.powerstats.strength + hero.powerstats.speed + 
  hero.powerstats.durability + hero.powerstats.power + hero.powerstats.combat) / 6)}/100`;
}

/**
 * Creates and configures the MCP server instance with all necessary tools and handlers.
 * This function sets up the complete server infrastructure including tool definitions
 * and request handlers for the superhero data access functionality.
 * 
 * @returns {Server} Configured MCP server instance ready to handle client requests
 */
function createServer(): Server {
  const server = new Server(
    {
      name: 'superheroes-mcp',
      version: '1.0.0',
    },
    {
      capabilities: {
        tools: {}, // Indicates this server provides tool capabilities
      },
    }
  );

  /**
   * Handler for listing available tools.
   * Provides clients with information about what tools this server offers
   * including their names, descriptions, and required parameters.
   */
  server.setRequestHandler(ListToolsRequestSchema, async () => {
    return {
      tools: [
        {
          name: 'search_superheroes',
          description: 'Search for superheroes by name (partial matching supported)',
          inputSchema: {
            type: 'object',
            properties: {
              query: {
                type: 'string',
                description: 'The superhero name or partial name to search for',
              },
            },
            required: ['query'],
          },
        },
        {
          name: 'get_superhero',
          description: 'Get detailed information about a specific superhero by ID',
          inputSchema: {
            type: 'object',
            properties: {
              id: {
                type: 'number',
                description: 'The unique identifier of the superhero',
              },
            },
            required: ['id'],
          },
        },
        {
          name: 'list_all_superheroes',
          description: 'Get a list of all available superheroes with basic information',
          inputSchema: {
            type: 'object',
            properties: {},
          },
        },
      ],
    };
  });

  /**
   * Handler for tool execution requests.
   * Routes incoming tool calls to the appropriate function based on the tool name
   * and processes the provided arguments to return the requested data.
   */
  server.setRequestHandler(CallToolRequestSchema, async (request) => {
    const { name, arguments: args } = request.params;

    try {
      switch (name) {
        case 'search_superheroes': {
          // Validate that the required query parameter is provided
          const query = args?.query;
          if (typeof query !== 'string') {
            throw new McpError(ErrorCode.InvalidParams, 'Query parameter must be a string');
          }

          // Perform the search and format results
          const results = await searchSuperheroesByName(query);
          
          if (results.length === 0) {
            return {
              content: [
                {
                  type: 'text',
                  text: `No superheroes found matching "${query}". Try searching with a different name or partial name.`,
                },
              ],
            };
          }

          // Format multiple results with summary information
          const formattedResults = results.map(hero => 
            `**${hero.name}** (ID: ${hero.id})\n- Overall Power: ${Math.round((hero.powerstats.intelligence + hero.powerstats.strength + hero.powerstats.speed + hero.powerstats.durability + hero.powerstats.power + hero.powerstats.combat) / 6)}/100`
          ).join('\n\n');

          return {
            content: [
              {
                type: 'text',
                text: `Found ${results.length} superhero(s) matching "${query}":\n\n${formattedResults}`,
              },
            ],
          };
        }

        case 'get_superhero': {
          // Validate that the required ID parameter is provided and is a number
          const id = args?.id;
          if (typeof id !== 'number') {
            throw new McpError(ErrorCode.InvalidParams, 'ID parameter must be a number');
          }

          // Retrieve the specific superhero
          const hero = await getSuperheroById(id);
          
          if (!hero) {
            return {
              content: [
                {
                  type: 'text',
                  text: `No superhero found with ID ${id}. Use the list_all_superheroes tool to see available IDs.`,
                },
              ],
            };
          }

          // Return detailed formatted information
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
          // Load all superhero data and provide summary information
          const superheroes = await loadSuperheroes();
          
          const summaryList = superheroes.map(hero => 
            `- **${hero.name}** (ID: ${hero.id})`
          ).join('\n');

          return {
            content: [
              {
                type: 'text',
                text: `Available superheroes (${superheroes.length} total):\n\n${summaryList}\n\nUse get_superhero with an ID to get detailed information about a specific superhero.`,
              },
            ],
          };
        }

        default:
          // Handle requests for non-existent tools
          throw new McpError(ErrorCode.MethodNotFound, `Unknown tool: ${name}`);
      }
    } catch (error) {
      // Ensure all errors are properly formatted as MCP errors
      if (error instanceof McpError) {
        throw error;
      }
      throw new McpError(
        ErrorCode.InternalError,
        `Tool execution failed: ${error instanceof Error ? error.message : String(error)}`
      );
    }
  });

  return server;
}

/**
 * Main function that initializes and starts the MCP server.
 * Sets up the server transport, handles connection lifecycle, and manages
 * graceful shutdown procedures.
 * 
 * This function serves as the entry point for the MCP server application.
 */
async function main(): Promise<void> {
  // Create the configured server instance
  const server = createServer();
  
  // Set up stdio transport for communication with MCP clients
  const transport = new StdioServerTransport();
  
  try {
    // Connect the server to the transport layer to enable client communication
    await server.connect(transport);
    
    // Log successful startup (only visible in debug mode, not sent to client)
    console.error('Superheroes MCP server running on stdio');
  } catch (error) {
    // Log startup errors to stderr for debugging
    console.error('Failed to start server:', error);
    process.exit(1);
  }
}

// Start the server if this file is run directly (not imported as a module)
if (import.meta.url === `file://${process.argv[1]}`) {
  main().catch((error) => {
    console.error('Unhandled error:', error);
    process.exit(1);
  });
}