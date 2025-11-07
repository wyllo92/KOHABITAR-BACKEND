import CpcgTypeModel from '../models/cpcgType.model.js';

class CpcgTypeController {
  async show(req, res) {
    try {
      const types = await CpcgTypeModel.findAllActive();
      return res.status(200).json({ message: 'CPCG types retrieved', data: types });
    } catch (error) {
      console.error('Error fetching CPCG types:', error);
      return res.status(500).json({ error: 'Internal Server Error' });
    }
  }
}

export default new CpcgTypeController();
