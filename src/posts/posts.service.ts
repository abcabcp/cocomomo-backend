import { BadRequestException, Injectable, NotFoundException } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { FindAllPostsDto, PostsResponseDto } from "./dto/find-all-posts.dto";
import { Post } from "./entities/post.entity";

@Injectable()
export class PostsService {
  constructor(
    @InjectRepository(Post)
    private postsRepository: Repository<Post>,
  ) {}

  async findAll(findAllPostsDto?: FindAllPostsDto): Promise<PostsResponseDto> {
    const { searchTerm, tags, pageIndex = 0, pageSize = 10 } = findAllPostsDto || {};

    const queryBuilder = this.postsRepository.createQueryBuilder("post");

    if (tags && tags.length > 0) {
      tags.forEach((tag, index) => {
        queryBuilder.andWhere(`post.tags LIKE :tag${index}`, { [`tag${index}`]: `%${tag}%` });
      });
    }

    if (searchTerm) {
      queryBuilder.andWhere("(post.title LIKE :searchTerm OR post.content LIKE :searchTerm)", {
        searchTerm: `%${searchTerm}%`,
      });
    }

    const totalCount = await queryBuilder.getCount();

    queryBuilder
      .orderBy("post.id", "DESC")
      .skip(pageIndex * pageSize)
      .take(pageSize);

    const list = await queryBuilder.getMany();

    return {
      list,
      totalCount,
    };
  }

  async findOne(id: number): Promise<Post> {
    const post = await this.postsRepository.findOne({ where: { id } });
    if (!post) {
      throw new NotFoundException(`Post with ID ${id} not found`);
    }
    return post;
  }

  async create(post: Partial<Post>): Promise<Post> {
    if (!post.title || !post.content) {
      throw new BadRequestException("Title and content are required");
    }

    const newPost = this.postsRepository.create(post);
    return this.postsRepository.save(newPost);
  }

  async update(id: number, post: Partial<Post>): Promise<Post> {
    if (!post.title || !post.content) {
      throw new BadRequestException("Title and content are required");
    }

    const existingPost = await this.findOne(id);

    Object.assign(existingPost, post);

    return this.postsRepository.save(existingPost);
  }

  async remove(id: number): Promise<void> {
    await this.findOne(id);
    await this.postsRepository.delete(id);
  }
}
