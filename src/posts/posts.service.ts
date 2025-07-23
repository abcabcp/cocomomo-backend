import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { PostDto, PostRemoveResponseDto } from "./entities/post.entity";
import { User, UserRole } from "src/users/entities/user.entity";
import { PostsResponseDto } from "./dto/find-all-posts.dto";
import { CloudinaryService } from "src/common/cloudinary/cloudinary.service";
import { PostException } from "src/common/exceptions/post.exception";
import { ImageUploadException } from "src/common/exceptions/image-upload.exception";

@Injectable()
export class PostsService {
  constructor(
    @InjectRepository(PostDto)
    private postsRepository: Repository<PostDto>,
    private readonly cloudinaryService: CloudinaryService,
  ) {}

  async findAll(
    page: number,
    limit: number,
    searchTerm?: string,
    tags?: string,
  ): Promise<PostsResponseDto> {
    const queryBuilder = this.postsRepository.createQueryBuilder("post");
    if (tags && tags.length > 0) {
      try {
        const tagArray = tags.split(",");
        queryBuilder.andWhere(
          new Array(tagArray.length)
            .fill("post.tags LIKE :tag")
            .map((condition, index) => `${condition}${index}`)
            .join(" OR "),
          tagArray.reduce((params, tag, index) => {
            params[`tag${index}`] = `%${tag}%`;
            return params;
          }, {}),
        );
      } catch {
        throw PostException.invalidTags();
      }
    }

    if (searchTerm) {
      queryBuilder.andWhere("(post.title LIKE :searchTerm OR post.content LIKE :searchTerm)", {
        searchTerm: `%${searchTerm}%`,
      });
    }

    const totalCount = await queryBuilder.getCount();

    queryBuilder
      .orderBy("post.id", "DESC")
      .skip((page - 1) * limit)
      .take(limit);

    const list = await queryBuilder.getMany();

    return {
      list,
      totalCount,
    };
  }

  async getAllTags(): Promise<{ title: string; count: number }[]> {
    const posts = await this.postsRepository.find();

    const tagCountMap = new Map<string, number>();
    const totalPostCount = posts.length;

    tagCountMap.set("전체", totalPostCount);

    for (const post of posts) {
      if (post.tags && post.tags.length > 0) {
        for (const tag of post.tags) {
          const count = tagCountMap.get(tag) || 0;
          tagCountMap.set(tag, count + 1);
        }
      }
    }

    const tagList = Array.from(tagCountMap.entries()).map(([title, count]) => ({
      title,
      count,
    }));

    return tagList.sort((a, b) => b.count - a.count);
  }

  async findOne(id: number): Promise<PostDto> {
    const post = await this.postsRepository.findOne({ where: { id } });
    if (!post) {
      throw PostException.notFound(id);
    }
    return post;
  }

  async create(post: Partial<PostDto>): Promise<PostDto> {
    if (!post.title || !post.content) {
      throw PostException.missingRequiredFields();
    }
    const newPost = this.postsRepository.create(post);
    return this.postsRepository.save(newPost);
  }

  async update(id: number, post: Partial<PostDto>): Promise<PostDto> {
    if (!post.title || !post.content) {
      throw PostException.missingRequiredFields();
    }

    const existingPost = await this.findOne(id);

    Object.assign(existingPost, post);

    return this.postsRepository.save(existingPost);
  }

  async remove(id: number, currentUser: User): Promise<PostRemoveResponseDto> {
    if (currentUser.role !== UserRole.ADMIN) {
      throw PostException.forbidden();
    }

    await this.findOne(id);
    await this.postsRepository.delete(id);
    return { id: id };
  }

  async addImage(images?: Express.Multer.File[]) {
    if (!images) {
      throw ImageUploadException.imageRequired();
    }

    try {
      const imageUrls = await Promise.all(
        images.map((image) => this.cloudinaryService.uploadImage(image)),
      );
      return imageUrls;
    } catch (error) {
      if (error instanceof ImageUploadException) {
        throw error;
      }
      throw ImageUploadException.uploadFailed(error.message);
    }
  }
}
