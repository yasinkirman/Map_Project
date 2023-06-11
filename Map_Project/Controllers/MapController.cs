using Map_Project.Models;
using Microsoft.AspNetCore.Mvc;
using Newtonsoft.Json;
using System.Diagnostics;
using System.Collections.Generic;
using Microsoft.Extensions.Logging;


namespace Map_Project.Controllers
{
    public class MapController : Controller
    {
        private readonly ILogger<MapController> _logger;
        public MapController(ILogger<MapController> logger)
        {
            _logger = logger;
        }

        private static List<Point> points;
        static MapController()
        {
            string json = System.IO.File.ReadAllText("db.json");
            points = JsonConvert.DeserializeObject<List<Point>>(json) ?? new List<Point>();
        }

        [HttpGet("api/get-point")]
        public ActionResult<IEnumerable<Point>> GetPoints()
        {
            return Ok(points);
        }

        public ViewResult Index()
        {
            return View();
        }

        [HttpPost("api/save-point")]
        public ActionResult<Point> SavePoint([FromBody] Point point)
        {
            point.id = points.Count > 0 ? points[points.Count - 1].id + 1 : 0;
            points.Add(point);

            string json = JsonConvert.SerializeObject(points);
            System.IO.File.WriteAllText("db.json", json);

            return Ok(point);
        }

        [HttpDelete("api/delete-point/{id}")]
        public IActionResult DeletePoint(int id)
        {
            var point = points.FirstOrDefault(p => p.id == id);
            if (point == null)
            {
                return NotFound();
            }

            points.Remove(point);

            string json = JsonConvert.SerializeObject(points);
            System.IO.File.WriteAllText("db.json", json);

            return NoContent();
        }


        public IActionResult Privacy()
        {
            return View();
        }

        [ResponseCache(Duration = 0, Location = ResponseCacheLocation.None, NoStore = true)]
        public IActionResult Error()
        {
            return View(new ErrorViewModel { RequestId = Activity.Current?.Id ?? HttpContext.TraceIdentifier });
        }
    }
}