<?php
  $base_dir = '../';
  $page_title = "Account - Login";
?>

<?php
  include $base_dir . 'functions/config.php';

  $additional_head = '';
  include $base_dir . 'content/layout/head.php';
?>
<body>
  <div class="main">
    <div class="wrapper">
      <div class="top-links bg-white">
        <div class="container align-r">
          <a href="<?= $config['base_url'] ?>/account/register.php">Register</a>
          <a href="<?= $config['base_url'] ?>/account/login.php">Login</a>
          <select name="ciudades" id="ciudades">
            <option value="lapaz">La Paz</option>
            <option value="santacruz">Santa Cruz</option>
            <option value="tarija">Tarija</option>
            <option value="pando">Pando</option>
          </select>
        </div>
      </div>
      <div class="container bg-white">
        Account - Login Page
      </div>
    </div>
  </div>

  <?php
    include $base_dir . 'content/layout/foot.php';
  ?>
</body>