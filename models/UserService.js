// FileName: MultipleFiles/UserService.js (Antigo MultipleFiles/Service.js)
const User = require('./User'); // Caminho corrigido para o modelo User
const bcrypt = require('bcryptjs');

class UserService {
  /**
   * Cria um novo usuário no sistema
   * @param {Object} userData - Dados do usuário
   * @returns {Promise<Object>} Resultado da operação
   */
  static async createUser(userData) {
    try {
      const {
        username,
        password,
        documentId,
        dateOfBirth,
        phone,
        cep,
        addressNumber,
        addressComplement,
        addressStreet,
        addressNeighborhood
      } = userData;

      // Verificar se usuário ou documento já existem
      const existingUser = await User.findOne({
        $or: [{ username }, { documentId }]
      });

      if (existingUser) {
        let errorDetails = {};
        if (existingUser.username === username) {
          errorDetails.username = 'Nome de usuário já está em uso';
        }
        if (existingUser.documentId === documentId) {
          errorDetails.documentId = 'CPF/RG já cadastrado no sistema';
        }
        return { success: false, errors: errorDetails, status: 409 }; // 409 Conflict
      }

      // Validar data de nascimento
      const birthDate = new Date(dateOfBirth);
      const today = new Date();
      const age = today.getFullYear() - birthDate.getFullYear();

      // Ajuste para verificar se o aniversário já passou no ano atual
      const m = today.getMonth() - birthDate.getMonth();
      if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
          age--;
      }

      if (age < 18) {
        return {
          success: false,
          errors: { dateOfBirth: 'Usuário deve ter pelo menos 18 anos' },
          status: 400 // Bad Request
        };
      }

      // Criptografar senha
      const hashedPassword = await bcrypt.hash(password, 10);

      // Criar novo usuário
      const newUser = new User({
        username,
        password: hashedPassword,
        documentId,
        dateOfBirth: birthDate,
        phone,
        cep,
        addressNumber,
        addressComplement: addressComplement || '',
        addressStreet,
        addressNeighborhood
      });

      await newUser.save();

      return {
        success: true,
        message: 'Usuário criado com sucesso',
        user: {
          id: newUser._id,
          username: newUser.username,
          role: newUser.role
        },
        status: 201 // Created
      };

    } catch (error) {
      console.error('Erro no UserService.createUser:', error);

      if (error.name === 'ValidationError') {
        const validationErrors = {};
        Object.keys(error.errors).forEach(key => {
          validationErrors[key] = error.errors[key].message;
        });
        return { success: false, errors: validationErrors, status: 400 }; // Bad Request
      }

      return {
        success: false,
        errors: { general: 'Erro interno do servidor ao criar usuário' },
        status: 500 // Internal Server Error
      };
    }
  }

  /**
   * Busca usuário por username para login
   * @param {string} username - Nome de usuário
   * @returns {Promise<Object|null>} Usuário encontrado ou null
   */
  static async findUserByUsername(username) {
    try {
      return await User.findOne({ username });
    } catch (error) {
      console.error('Erro no UserService.findUserByUsername:', error);
      throw error; // Re-throw para ser tratado pelo chamador
    }
  }

  /**
   * Valida as credenciais do usuário
   * @param {string} username - Nome de usuário
   * @param {string} password - Senha
   * @returns {Promise<Object>} Resultado da validação
   */
  static async validateCredentials(username, password) {
    try {
      const user = await this.findUserByUsername(username);

      if (!user) {
        return { isValid: false, message: 'Usuário não encontrado', status: 401 };
      }

      const isPasswordValid = await bcrypt.compare(password, user.password);

      if (!isPasswordValid) {
        return { isValid: false, message: 'Senha incorreta', status: 401 };
      }

      return {
        isValid: true,
        user: {
          id: user._id,
          username: user.username,
          role: user.role
        },
        status: 200
      };

    } catch (error) {
      console.error('Erro no UserService.validateCredentials:', error);
      return { isValid: false, message: 'Erro ao validar credenciais', status: 500 };
    }
  }

  /**
   * Busca usuário por ID
   * @param {string} userId - ID do usuário
   * @returns {Promise<Object|null>} Usuário encontrado ou null
   */
  static async getUserById(userId) {
    try {
      return await User.findById(userId).select('-password'); // Exclui a senha do resultado
    } catch (error) {
      console.error('Erro no UserService.getUserById:', error);
      throw error;
    }
  }

  /**
   * Atualiza dados do usuário
   * @param {string} userId - ID do usuário
   * @param {Object} updateData - Dados para atualizar
   * @returns {Promise<Object>} Resultado da operação
   */
  static async updateUser(userId, updateData) {
    try {
      // Remove campos que não podem ser atualizados
      const { password, username, documentId, role, ...allowedUpdates } = updateData;

      const updatedUser = await User.findByIdAndUpdate(
        userId,
        allowedUpdates,
        { new: true, runValidators: true }
      ).select('-password');

      if (!updatedUser) {
        return { success: false, message: 'Usuário não encontrado', status: 404 };
      }

      return { success: true, user: updatedUser, status: 200 };

    } catch (error) {
      console.error('Erro no UserService.updateUser:', error);

      if (error.name === 'ValidationError') {
        const validationErrors = {};
        Object.keys(error.errors).forEach(key => {
          validationErrors[key] = error.errors[key].message;
        });
        return { success: false, errors: validationErrors, status: 400 };
      }

      return { success: false, message: 'Erro ao atualizar usuário', status: 500 };
    }
  }
}

module.exports = UserService;
