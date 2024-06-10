
const express = require('express');
const router = express.Router();

router.get('/', (req, res) => {
  req.session.destroy((err) => {
    if (err) {
      return res.status(500).send('Could not log out');
    }
    res.clearCookie('connect.sid', { path: '/' });
    res.send(`
        <script>
          sessionStorage.clear();
          window.location.href = '/';
        </script>
      `);
    });
  });

module.exports = router;
