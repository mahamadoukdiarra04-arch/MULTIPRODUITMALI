import argparse
import math
import os
import sys

import bpy
from mathutils import Vector


PRODUCTS = [
    ("tropicoul-ananas", "tropicoul-ananas.glb"),
    ("tropicoul-orange", "tropicoul-orange.glb"),
    ("tropicoul-mangue", "tropicoul-mangue.glb"),
    ("tropicoul-goyave", "tropicoul-goyave.glb"),
    ("tropicoul-cocktail", "tropicoul-cocktail.glb"),
    ("tropicoul-tamarin", "tropicoul-tamarin.glb"),
    ("triplex", "triplex-energy-drink.glb"),
    ("vimto", "vimto.glb"),
]

VIEWS = {
    "front": 0.0,
    "left": math.pi / 2,
    "back": math.pi,
    "right": -math.pi / 2,
}


def parse_args():
    parser = argparse.ArgumentParser()
    parser.add_argument("--models", required=True)
    parser.add_argument("--output", required=True)
    parser.add_argument("--product")
    parser.add_argument("--views", nargs="+", choices=tuple(VIEWS), default=tuple(VIEWS))
    parser.add_argument("--resolution", type=int, default=2048)
    parser.add_argument("--rotation-offset-degrees", type=float, default=0.0)
    args = sys.argv[sys.argv.index("--") + 1 :] if "--" in sys.argv else []
    return parser.parse_args(args)


def look_at(obj, point):
    direction = Vector(point) - obj.location
    obj.rotation_euler = direction.to_track_quat("-Z", "Y").to_euler()


def add_area_light(name, location, energy, size, color):
    data = bpy.data.lights.new(name=name, type="AREA")
    data.energy = energy
    data.shape = "DISK"
    data.size = size
    data.color = color
    light = bpy.data.objects.new(name=name, object_data=data)
    bpy.context.collection.objects.link(light)
    light.location = location
    look_at(light, (0, 0, 0))
    return light


def configure_scene(resolution):
    scene = bpy.context.scene
    scene.render.engine = "BLENDER_EEVEE"
    scene.render.resolution_x = resolution
    scene.render.resolution_y = resolution
    scene.render.resolution_percentage = 100
    scene.render.image_settings.file_format = "PNG"
    scene.render.image_settings.color_mode = "RGBA"
    scene.render.film_transparent = True
    scene.render.use_file_extension = True
    scene.render.image_settings.color_depth = "8"
    scene.render.image_settings.compression = 42
    scene.eevee.taa_render_samples = 8

    try:
        scene.view_settings.look = "AgX - Medium High Contrast"
    except TypeError:
        pass
    scene.view_settings.view_transform = "AgX"
    scene.view_settings.exposure = 0.15

    world = bpy.data.worlds.new("Product World")
    world.use_nodes = True
    background = world.node_tree.nodes.get("Background")
    background.inputs["Color"].default_value = (0.92, 0.92, 0.92, 1)
    background.inputs["Strength"].default_value = 0.38
    scene.world = world

    camera_data = bpy.data.cameras.new("Product Camera")
    camera = bpy.data.objects.new("Product Camera", camera_data)
    bpy.context.collection.objects.link(camera)
    camera.location = (0, -7.15, 0.05)
    camera_data.lens = 70
    camera_data.sensor_width = 36
    camera_data.dof.use_dof = False
    look_at(camera, (0, 0, 0))
    scene.camera = camera

    add_area_light("Key", (3.8, -5.5, 4.8), 740, 4.5, (1.0, 0.98, 0.95))
    add_area_light("Fill", (-4.2, -3.2, 1.6), 510, 5.0, (0.78, 0.86, 1.0))
    add_area_light("Rim", (-2.2, 3.4, 3.2), 680, 3.4, (1.0, 0.72, 0.62))
    add_area_light("Top", (0.2, 0.8, 6.0), 420, 3.0, (1.0, 1.0, 1.0))


def clear_product():
    preserved = {"Product Camera", "Key", "Fill", "Rim", "Top"}
    for obj in list(bpy.context.scene.objects):
        if obj.name not in preserved:
            bpy.data.objects.remove(obj, do_unlink=True)


def fit_imported_product():
    meshes = [obj for obj in bpy.context.scene.objects if obj.type == "MESH"]
    if not meshes:
        raise RuntimeError("No mesh imported from GLB.")

    corners = [obj.matrix_world @ Vector(corner) for obj in meshes for corner in obj.bound_box]
    minimum = Vector((min(point.x for point in corners), min(point.y for point in corners), min(point.z for point in corners)))
    maximum = Vector((max(point.x for point in corners), max(point.y for point in corners), max(point.z for point in corners)))
    center = (minimum + maximum) / 2
    size = maximum - minimum
    scale = 3.12 / max(size.x, size.y, size.z)

    group = bpy.data.objects.new("Product Root", None)
    bpy.context.collection.objects.link(group)
    top_level = [obj for obj in bpy.context.scene.objects if obj != group and obj.parent is None and obj.name not in {"Product Camera", "Key", "Fill", "Rim", "Top"}]
    for obj in top_level:
        obj.parent = group

    group.scale = (scale, scale, scale)
    group.location = (-center.x * scale, -center.y * scale, -center.z * scale)
    return group


def render_product(product_id, model_path, output_root, requested_views, rotation_offset_degrees):
    clear_product()
    bpy.ops.import_scene.gltf(filepath=model_path, import_pack_images=True)
    product_root = fit_imported_product()
    output_dir = os.path.join(output_root, product_id)
    os.makedirs(output_dir, exist_ok=True)

    for view, angle in VIEWS.items():
        if view not in requested_views:
            continue
        product_root.rotation_euler = (0, 0, angle + math.radians(rotation_offset_degrees))
        bpy.context.view_layer.update()
        bpy.context.scene.render.filepath = os.path.join(output_dir, f"{view}.png")
        bpy.ops.render.render(write_still=True)
        print(f"Rendered {product_id}/{view}")


args = parse_args()
bpy.ops.wm.read_factory_settings(use_empty=True)
configure_scene(args.resolution)

for product_id, file_name in PRODUCTS:
    if args.product and args.product != product_id:
        continue
    render_product(
        product_id,
        os.path.abspath(os.path.join(args.models, file_name)),
        os.path.abspath(args.output),
        args.views,
        args.rotation_offset_degrees,
    )
