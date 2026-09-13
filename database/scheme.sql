CREATE TABLE `jugadores` (
  `id_jugador` int NOT NULL AUTO_INCREMENT,
  `nombre` varchar(100) NOT NULL,
  `gamertag` varchar(50) NOT NULL,
  `correo` varchar(100) NOT NULL,
  `fecha_registro` datetime NOT NULL,
  PRIMARY KEY (`id_jugador`),
  UNIQUE KEY `UNIQUE` (`gamertag`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;


CREATE TABLE `videojuegos` (
  `id_videojuego` int NOT NULL AUTO_INCREMENT,
  `nombre` varchar(100) NOT NULL,
  `genero` varchar(50) NOT NULL,
  PRIMARY KEY (`id_videojuego`),
  UNIQUE KEY `UNIQUE` (`nombre`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;


CREATE TABLE `puntuaciones` (
  `id_puntuacion` int NOT NULL AUTO_INCREMENT,
  `id_jugador` int NOT NULL,
  `id_videojuego` int NOT NULL,
  `puntuacion` int NOT NULL,
  `fecha` datetime NOT NULL,
  PRIMARY KEY (`id_puntuacion`),
  KEY `fk_puntuaciones_jugador` (`id_jugador`),
  KEY `fk_puntuaciones_videojuego` (`id_videojuego`),
  CONSTRAINT `fk_puntuaciones_jugador` FOREIGN KEY (`id_jugador`) REFERENCES `jugadores` (`id_jugador`) ON DELETE RESTRICT ON UPDATE RESTRICT,
  CONSTRAINT `fk_puntuaciones_videojuego` FOREIGN KEY (`id_videojuego`) REFERENCES `videojuegos` (`id_videojuego`) ON DELETE RESTRICT ON UPDATE RESTRICT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
