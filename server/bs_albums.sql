-- phpMyAdmin SQL Dump
-- version 5.1.2
-- https://www.phpmyadmin.net/
--
-- Host: localhost:3306
-- Generation Time: Mar 24, 2026 at 03:23 AM
-- Server version: 5.7.24
-- PHP Version: 8.3.1

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Database: `bs_albums`
--

-- --------------------------------------------------------

--
-- Table structure for table `albums`
--

CREATE TABLE `albums` (
  `id` int(11) NOT NULL,
  `title` varchar(255) NOT NULL,
  `image_filename` varchar(255) DEFAULT NULL,
  `year` int(11) NOT NULL,
  `artist_id` int(11) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

--
-- Dumping data for table `albums`
--

INSERT INTO `albums` (`id`, `title`, `image_filename`, `year`, `artist_id`) VALUES
(1, 'God Does Like Ugly', '1774322041253-GodDoesLikeUgly.jpg', 2025, 1),
(2, 'DAMN.', '1774322052243-DAMN.png', 2017, 2),
(3, 'IGOR', '1774322068418-IGOR.jpg', 2019, 3),
(7, 'Ca$ino', '1774322121565-Casino.png', 2026, 5),
(8, 'Alligator Bites Never Heal', '1774322152906-AligatorBites.png', 2024, 6),
(9, 'Marbled', '1774322190536-Marbled.jpg', 2018, 7),
(10, 'The Divine Feminine', '1774322215293-DivineFeminine.png', 2016, 8),
(11, 'After The Sun Goes Down', '1774322313681-AfterTheSun.jpg', 2025, 9),
(12, 'Masego', '1774322382633-Masego-Self-Titled-2.webp', 2023, 10),
(13, 'Channel Orange', '1774322428757-Channel_ORANGE.jpg', 2012, 11),
(14, 'Heavy', '1774322478410-Sir_-_Heavy.png', 2024, 12),
(15, 'Limbo', '1774322564674-Limbo_by_AminÃ©_Album_Cover.png', 2020, 13);

-- --------------------------------------------------------

--
-- Table structure for table `artists`
--

CREATE TABLE `artists` (
  `id` int(11) NOT NULL,
  `name` varchar(255) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

--
-- Dumping data for table `artists`
--

INSERT INTO `artists` (`id`, `name`) VALUES
(1, 'JID'),
(2, 'Kendrick Lamar'),
(3, 'Tyler The Creator'),
(4, 'Kanye West'),
(5, 'Baby Keem'),
(6, 'Doechii'),
(7, 'Abhi The Nomad'),
(8, 'Mac Miller'),
(9, 'Khalid'),
(10, 'Masego'),
(11, 'Frank Ocean'),
(12, 'SiR'),
(13, 'Amine');

--
-- Indexes for dumped tables
--

--
-- Indexes for table `albums`
--
ALTER TABLE `albums`
  ADD PRIMARY KEY (`id`),
  ADD KEY `artist_id` (`artist_id`);

--
-- Indexes for table `artists`
--
ALTER TABLE `artists`
  ADD PRIMARY KEY (`id`);

--
-- AUTO_INCREMENT for dumped tables
--

--
-- AUTO_INCREMENT for table `albums`
--
ALTER TABLE `albums`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=16;

--
-- AUTO_INCREMENT for table `artists`
--
ALTER TABLE `artists`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=14;

--
-- Constraints for dumped tables
--

--
-- Constraints for table `albums`
--
ALTER TABLE `albums`
  ADD CONSTRAINT `albums_ibfk_1` FOREIGN KEY (`artist_id`) REFERENCES `artists` (`id`) ON DELETE CASCADE;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
