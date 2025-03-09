<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Contact Form</title>
</head>
<body>
  <form action="contact.php" method="post">
    <label for="name">Name:</label>
    <input type="text" id="name" name="name" required><br><br>
    
    <label for="email">Email:</label>
    <input type="email" id="email" name="email" required><br><br>
    
    <label for="subject">Subject:</label>
    <input type="text" id="subject" name="subject" required><br><br>
    
    <label for="message">Message:</label>
    <textarea id="message" name="message" required></textarea><br><br>
    
    <input type="submit" value="Send">
  </form>
</body>
</html>
