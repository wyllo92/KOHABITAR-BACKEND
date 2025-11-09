import AmenityModel from "../models/amenity.model.js";

class AmenityController {
  async register(req, res) {
    try {
      const {
        name,
        capacity,
        description,
        status_id,
        amenity_type_id,
      } = req.body;

      // Basic validation: name required. status_id optional (default to 1)
      if (!name) {
        return res.status(400).json({ error: "The field 'name' is required" });
      }
      const statusIdToUse = status_id || 1;

      console.log("Creating amenity with data:", req.body); // Debug log

      const amenityId = await AmenityModel.create({
        name,
        capacity,
        description,
        status_id: statusIdToUse,
        amenity_type_id,
      });

      console.log('Amenity created with ID:', amenityId);

      if (!amenityId) {
        return res.status(500).json({ error: 'Failed to create amenity' });
      }

      // Fetch the created row to return a consistent payload
      const created = await AmenityModel.findById(amenityId);

      res.status(201).json({
        message: 'Amenity created successfully',
        data: created,
      });
    } catch (error) {
      console.error("Error creating amenity:", error);
      res.status(500).json({ error: "Internal Server Error" });
    }
  }

  async show(req, res) {
    try {
      const amenityModel = await AmenityModel.showActive();
      res.status(200).json({
        success: true,
        message: "Amenities retrieved successfully",
        data: amenityModel,
      });
    } catch (error) {
      console.error("Error retrieving amenities:", error);
      res.status(500).json({
        success: false,
        error: "Internal Server Error",
      });
    }
  }

  async update(req, res) {
    try {
      const {
        name,
        capacity,
        description,
        status_id,
        amenity_type_id,
      } = req.body;
      
      const id = req.params.id;

      // Validación básica
      if (!name || !id) {
        return res.status(400).json({ error: "Required fields are missing" });
      }

      // Verificar si el amenity existe
      const existingAmenity = await AmenityModel.findById(id);
      if (!existingAmenity) {
        return res.status(404).json({ error: "Amenity not found" });
      }

      // Ejecutar update (la fecha se maneja automáticamente en el modelo)
      const updatedAmenity = await AmenityModel.update(id, {
        name,
        capacity,
        description,
        status_id: status_id || existingAmenity.status_id,
        amenity_type_id,
      });

      if (!updatedAmenity) {
        return res.status(400).json({ error: "Update failed or no changes made" });
      }

      return res.status(200).json({
        message: "Amenity updated successfully",
        data: updatedAmenity,
      });

    } catch (error) {
      console.error("Error updating amenity:", error);
      return res.status(500).json({ error: "Internal Server Error" });
    }
  }

  async delete(req, res) {
    try {
      const id = req.params.id;
      
      if (!id) {
        return res.status(400).json({ error: "Required fields are missing" });
      }

      // Verificar si existe antes de eliminar
      const existingAmenity = await AmenityModel.findById(id);
      if (!existingAmenity) {
        return res.status(404).json({ error: "Amenity not found" });
      }

      const deleteResult = await AmenityModel.delete(id);
      
      res.status(200).json({
        message: "Amenity deleted successfully",
        data: deleteResult,
      });
    } catch (error) {
      console.error("Error deleting amenity:", error);
      res.status(500).json({ error: "Internal Server Error" });
    }
  }

  async findById(req, res) {
    try {
      const id = req.params.id;
      
      if (!id) {
        return res.status(400).json({ error: "Required fields are missing" });
      }

      const existingAmenity = await AmenityModel.findByIdActive(id);
      if (!existingAmenity) {
        return res.status(404).json({ error: "The Amenity does not exist" });
      }

      res.status(200).json({
        message: "Amenity retrieved successfully",
        data: existingAmenity,
      });
    } catch (error) {
      console.error("Error finding amenity:", error);
      res.status(500).json({ error: "Internal Server Error" });
    }
  }
}

export default new AmenityController();