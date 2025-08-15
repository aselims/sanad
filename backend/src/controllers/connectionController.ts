import { Request, Response } from 'express';
import { AppDataSource } from '../config/data-source';
import { Connection, ConnectionStatus } from '../entities/Connection';
import { User } from '../entities/User';

/**
 * Send a connection request to another user
 */
export const sendConnectionRequest = async (req: Request, res: Response) => {
  try {
    if (!req.user || !req.user.id) {
      return res.status(401).json({
        status: 'error',
        message: 'Unauthorized: User not authenticated',
      });
    }

    const { targetUserId } = req.body;

    if (!targetUserId) {
      return res.status(400).json({
        status: 'error',
        message: 'Target user ID is required',
      });
    }

    // Check if target user exists
    const userRepository = AppDataSource.getRepository(User);
    const targetUser = await userRepository.findOne({ where: { id: targetUserId } });

    if (!targetUser) {
      return res.status(404).json({
        status: 'error',
        message: 'Target user not found',
      });
    }

    // Check if target user allows connections
    if (!targetUser.allowConnections) {
      return res.status(403).json({
        status: 'error',
        message: 'This user does not allow connection requests',
      });
    }

    // Check if a connection already exists
    const connectionRepository = AppDataSource.getRepository(Connection);
    const existingConnection = await connectionRepository.findOne({
      where: [
        { requesterId: req.user.id, receiverId: targetUserId },
        { requesterId: targetUserId, receiverId: req.user.id },
      ],
    });

    if (existingConnection) {
      return res.status(400).json({
        status: 'error',
        message: 'A connection already exists between these users',
        data: existingConnection,
      });
    }

    // Create new connection request
    const newConnection = connectionRepository.create({
      requesterId: req.user.id,
      receiverId: targetUserId,
      status: ConnectionStatus.PENDING,
    });

    await connectionRepository.save(newConnection);

    return res.status(201).json({
      status: 'success',
      message: 'Connection request sent successfully',
      data: newConnection,
    });
  } catch (error) {
    console.error('Error sending connection request:', error);
    return res.status(500).json({
      status: 'error',
      message: 'Internal server error',
    });
  }
};

/**
 * Get all connection requests for the current user
 */
export const getConnectionRequests = async (req: Request, res: Response) => {
  try {
    if (!req.user || !req.user.id) {
      return res.status(401).json({
        status: 'error',
        message: 'Unauthorized: User not authenticated',
      });
    }

    const connectionRepository = AppDataSource.getRepository(Connection);
    const connections = await connectionRepository.find({
      where: [{ receiverId: req.user.id, status: ConnectionStatus.PENDING }],
      relations: ['requester'],
    });

    return res.status(200).json({
      status: 'success',
      data: connections,
    });
  } catch (error) {
    console.error('Error getting connection requests:', error);
    return res.status(500).json({
      status: 'error',
      message: 'Internal server error',
    });
  }
};

/**
 * Get all connections for the current user
 */
export const getUserConnections = async (req: Request, res: Response) => {
  try {
    if (!req.user || !req.user.id) {
      return res.status(401).json({
        status: 'error',
        message: 'Unauthorized: User not authenticated',
      });
    }

    const connectionRepository = AppDataSource.getRepository(Connection);
    const connections = await connectionRepository.find({
      where: [
        { requesterId: req.user.id, status: ConnectionStatus.ACCEPTED },
        { receiverId: req.user.id, status: ConnectionStatus.ACCEPTED },
      ],
      relations: ['requester', 'receiver'],
    });

    // Format the connections to include the connected user (not the current user)
    const formattedConnections = connections.map(connection => {
      const connectedUser =
        connection.requesterId === req.user!.id ? connection.receiver : connection.requester;

      return {
        id: connection.id,
        user: connectedUser,
        status: connection.status,
        createdAt: connection.createdAt,
      };
    });

    return res.status(200).json({
      status: 'success',
      data: formattedConnections,
    });
  } catch (error) {
    console.error('Error getting user connections:', error);
    return res.status(500).json({
      status: 'error',
      message: 'Internal server error',
    });
  }
};

/**
 * Respond to a connection request
 */
export const respondToConnectionRequest = async (req: Request, res: Response) => {
  try {
    if (!req.user || !req.user.id) {
      return res.status(401).json({
        status: 'error',
        message: 'Unauthorized: User not authenticated',
      });
    }

    const { connectionId, action } = req.body;

    if (!connectionId || !action) {
      return res.status(400).json({
        status: 'error',
        message: 'Connection ID and action are required',
      });
    }

    if (action !== 'accept' && action !== 'reject') {
      return res.status(400).json({
        status: 'error',
        message: 'Action must be either "accept" or "reject"',
      });
    }

    const connectionRepository = AppDataSource.getRepository(Connection);
    const connection = await connectionRepository.findOne({
      where: { id: connectionId, receiverId: req.user.id, status: ConnectionStatus.PENDING },
    });

    if (!connection) {
      return res.status(404).json({
        status: 'error',
        message: 'Connection request not found or you are not authorized to respond to it',
      });
    }

    // Update connection status
    connection.status = action === 'accept' ? ConnectionStatus.ACCEPTED : ConnectionStatus.REJECTED;
    await connectionRepository.save(connection);

    return res.status(200).json({
      status: 'success',
      message: `Connection request ${action === 'accept' ? 'accepted' : 'rejected'} successfully`,
      data: connection,
    });
  } catch (error) {
    console.error('Error responding to connection request:', error);
    return res.status(500).json({
      status: 'error',
      message: 'Internal server error',
    });
  }
};
