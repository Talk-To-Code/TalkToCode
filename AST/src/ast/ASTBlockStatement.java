package ast;

/**
 * @author GAO RISHENG A0101891L
 * This class is mainly the conclusion of all block statements such as if_else, while,do_while,for_loop,
 * switch,function_declaration,struct_declaration,object_constructor,class_declaration
 *
 */
public class ASTBlockStatement extends ASTStatement {
	private static final String NODE_TYPE = "Block Statement";
	protected int indent = 0;
	public ASTBlockStatement() {
		super();
		this.isBlock = true;
	}
	public void setIndent(int indent){
		this.indent = indent;
	}
	//virtual method
	public String toSyntax(){
		this.result = "\n";
		return this.result;
	}
	//virtual method
	public String typeof(){
		return super.typeof()+"->"+NODE_TYPE;
	}
}
