const repositorioDAO = require("../models/repositorio.dao");

module.exports = async (req, res, next) => {
  try {
    const materiaId = req.body.materia_id || req.query.materia_id;

    if (!materiaId) {
      return res.status(400).send("Materia não informada.");
    }

    const disciplina = await repositorioDAO.findDisciplinaByMateria(materiaId);

    if (!disciplina || !disciplina.curso_id) {
      return res.status(400).send("Curso não encontrado para a matéria informada.");
    }

    req.curso_id = disciplina.curso_id;

    next();
  } catch (err) {
    console.error("Erro ao resolver curso:", err);
    res.status(500).send("Erro ao resolver curso.");
  }
};
