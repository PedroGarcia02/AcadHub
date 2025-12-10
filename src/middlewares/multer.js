const multer = require('multer');
const path = require('path');
const fs = require('fs');

const uploadFolders = {
  forum: path.join(__dirname, '../../public/images/forum'),
  user: path.join(__dirname, '../../public/images/users'),
  conteudos: path.join(__dirname, '../../uploads/conteudos'),
  tarefas: path.join(__dirname, '../../uploads/tarefas')
};

for (const folder of Object.values(uploadFolders)) {
  if (!fs.existsSync(folder)) {
    fs.mkdirSync(folder, { recursive: true });
  }
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    let folder = uploadFolders.user;

    if (file.fieldname === 'conteudos') {
      folder = uploadFolders.conteudos;
      if (req.curso_id) {
        const cursoFolderName = req.curso_id;
        folder = path.join(uploadFolders.conteudos, cursoFolderName);
      }
    }

    else if (req.originalUrl.includes('/repo/tarefa/')) {
    const tarefaId = req.params.id || 'geral';
    folder = path.join(uploadFolders.tarefas, tarefaId);
    }

    else if (file.fieldname === 'tarefa') {
      folder = path.join(uploadFolders.tarefas);
    }

    else if (file.fieldname === 'forum') {
      folder = uploadFolders.forum;
    }

    else if (file.fieldname === 'user') {
      folder = uploadFolders.user;
    }

    if (!fs.existsSync(folder)) {
      fs.mkdirSync(folder, { recursive: true });
    }

    cb(null, folder);
  },

  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    const ext = path.extname(file.originalname);
    cb(null, file.fieldname + '-' + uniqueSuffix + ext);
  }
});

const fileFilter = (req, file, cb) => {
  const allowedMimes = [
    'image/jpeg', 'image/png', 'image/jpg', 'image/webp',
    'application/pdf', 'application/zip', 'application/x-zip-compressed'
  ];

  if (allowedMimes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Tipo de arquivo não permitido'), false);
  }
};

const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: 10 * 1024 * 1024 }
});

module.exports = upload;
