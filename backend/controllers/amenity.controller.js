import AmenityModel from "../models/amenity.model.js";

class AmenityController {
  async register(req, res) {
    try {
      const { name,
        capacity,
        description,
        time_unit,
        total,
        status_id,
        tariff_id,
        property_id,
        amenity_type_id,
      } = req.body;

      // Basic validation
      if (!name || !status_id) {
        return res.status(400).json({ error: "Required fields are missing" });
      }
      const amenityId = await AmenityModel.create({
        name,
        capacity,
        description,
        time_unit,
        total,
        status_id,
        tariff_id,
        property_id,
        amenity_type_id,
      });
      res.status(201).json({
        message: "Amenity created successfully",
        id: amenityId,
      });
    } catch (error) {
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
      time_unit,
      total,
      status_id,
      tariff_id,
      property_id,
      amenity_type_id,
    } = req.body;
    
    const id = req.params.id;

    // Validación básica
    if (!name || !status_id || !id) {
      return res.status(400).json({ error: "Required fields are missing" });
    }

    // Verificar si el amenity existe (no importa si está activo o no)
    const existingAmenity = await AmenityModel.findById(id);
    if (!existingAmenity) {
      return res.status(404).json({ error: "Amenity not found" });
    }

    // Preparar fecha de actualización
    const updated_at = new Date();

    // Ejecutar update
    const updatedAmenity = await AmenityModel.update(id, {
      name,
      capacity,
      description,
      time_unit,
      total,
      status_id,
      tariff_id,
      property_id,
      amenity_type_id,
      updated_at,
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
      // Basic validate
      if (!id) {
        return res.status(400).json({ error: "Required fields are missing" });
      }
      // Verify if the Amenity already exists
      const deleteAmenityModel = await AmenityModel.delete(id);
      res.status(201).json({
        message: "Amenity delete successfully",
        data: deleteAmenityModel,
      });
    } catch (error) {
      console.error("Error in registration:", error);
      res.status(500).json({ error: "Internal Server Error" });
    }
  }

  async findById(req, res) {
    try {
      const id = req.params.id;
      // Basic validate
      if (!id) {
        return res.status(400).json({ error: "Required fields are missing" });
      }
      // Verify if the Amenity already exists
      const existingAmenityModel = await AmenityModel.findByIdActive(id);
      if (!existingAmenityModel) {
        return res.status(409).json({ error: "The Amenity No already exists" });
      }
      res.status(201).json({
        message: "Amenity successfully",
        data: existingAmenityModel,
      });
    } catch (error) {
      console.error("Error in registration:", error);
      res.status(500).json({ error: "Internal Server Error" });
    }
  }
}

export default new AmenityController();
