import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { PostDto, PostRemoveResponseDto } from "./entities/post.entity";
import { User, UserRole } from "src/users/entities/user.entity";
import { PostsResponseDto } from "./dto/find-all-posts.dto";
import { CloudinaryService } from "src/common/cloudinary/cloudinary.service";

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
      throw new NotFoundException(`Post with ID ${id} not found`);
    }
    return post;
  }

  async create(post: Partial<PostDto>): Promise<PostDto> {
    if (!post.title || !post.content) {
      throw new BadRequestException("Title and content are required");
    }
    const newPost = this.postsRepository.create(post);
    return this.postsRepository.save(newPost);
  }

  async update(id: number, post: Partial<PostDto>): Promise<PostDto> {
    if (!post.title || !post.content) {
      throw new BadRequestException("Title and content are required");
    }

    const existingPost = await this.findOne(id);

    Object.assign(existingPost, post);

    return this.postsRepository.save(existingPost);
  }

  async remove(id: number, currentUser: User): Promise<PostRemoveResponseDto> {
    if (currentUser.role !== UserRole.ADMIN) {
      throw new ForbiddenException("관리자만 게시글을 삭제할 수 있습니다.");
    }
    await this.postsRepository.delete(id);
    return { id: id };
  }

  async addImage(images?: Express.Multer.File[]) {
    if (!images) {
      throw new BadRequestException("Images are required");
    }
    const imageUrls = await Promise.all(
      images.map((image) => this.cloudinaryService.uploadImage(image)),
    );
    return imageUrls;
  }
}
